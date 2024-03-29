import { Observable } from 'rxjs';
import { Balance } from './balance.interface';
import { Value } from './value.interface';
export interface Account {
    id?: number
    name: string
    isCredit: boolean
    isCard: boolean
    isActive?: boolean
    version?: Date
    accCategoryId: number
    balance$?: Observable<Balance>
    balanceByMonth$?: Observable<Balance>
    pendingValue$?: Observable<Value>
    pendingValueByMonth$?: Observable<Value>
}