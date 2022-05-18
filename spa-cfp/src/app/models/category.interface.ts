import { Observable } from 'rxjs';
import { Balance } from './balance.interface';
export interface Category {
    id?: number
    name: string
    catOwnerId: number
    isCredit: boolean
    isActive?: boolean
    version?: Date
    balance$?: Observable<Balance>
    balanceByMonth$?: Observable<Balance>
}