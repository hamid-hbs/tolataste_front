<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->filled('role'), fn ($q) => $q->where('role', $request->input('role')))
            ->when($request->filled('search'), fn ($q) => $q->where('name', 'like', "%{$request->input('search')}%"))
            ->orderBy('name')
            ->get();

        return response()->json(['users' => $users]);
    }

    public function staff(): JsonResponse
    {
        $staff = User::where('role', '!=', User::ROLE_CLIENT)->orderBy('name')->get();

        return response()->json(['users' => $staff]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = User::create($request->validated());

        return response()->json(['user' => $user], 201);
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return response()->json(['user' => $user->fresh()]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte.'], 409);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé.']);
    }
}
