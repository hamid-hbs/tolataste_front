<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTableRequest;
use App\Http\Requests\UpdateTableRequest;
use App\Http\Requests\UpdateTableStatusRequest;
use App\Models\Table;
use Illuminate\Http\JsonResponse;

class TableController extends Controller
{
    public function index(): JsonResponse
    {
        $tables = Table::withCount(['orders as active_orders' => fn ($q) => $q->whereIn('status', ['pending', 'waiting', 'preparing', 'ready'])])
            ->orderBy('number')
            ->get();

        return response()->json(['tables' => $tables]);
    }

    /**
     * Tables libres visibles par les clients (sans auth).
     * Utilisé sur l'écran commande pour choisir sa table.
     */
    public function available(): JsonResponse
    {
        $tables = Table::query()
            ->where('status', Table::STATUS_FREE)
            ->orderBy('number')
            ->get(['id', 'number', 'zone', 'status']);

        return response()->json(['tables' => $tables]);
    }

    public function store(StoreTableRequest $request): JsonResponse
    {
        $table = Table::create($request->validated());

        return response()->json(['table' => $table], 201);
    }

    public function update(UpdateTableRequest $request, Table $table): JsonResponse
    {
        $table->update($request->validated());

        return response()->json(['table' => $table->fresh()]);
    }

    public function updateStatus(UpdateTableStatusRequest $request, Table $table): JsonResponse
    {
        $table->update(['status' => $request->validated('status')]);

        return response()->json(['table' => $table->fresh()]);
    }

    public function destroy(Table $table): JsonResponse
    {
        if ($table->status === Table::STATUS_OCCUPIED) {
            return response()->json([
                'message' => 'Impossible de supprimer : la table est occupée par une commande en cours.',
            ], 409);
        }

        $table->delete();

        return response()->json(['message' => 'Table supprimée.']);
    }
}
