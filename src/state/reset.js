import { cartState } from './cart'
import { clientState } from './client'
import { ordersState } from './orders'
import { tablesState } from './tables'
import { menuState } from './menu'

export function resetAllStates() {
  cartState.reset()
  clientState.reset()
  ordersState.reset()
  tablesState.reset()
  menuState.reset()
}