import { Observable } from 'rxjs';
import { Balance } from './balance.interface';
export interface Account {
    id?: number
    name: string
    isCredit: boolean
    isCard: boolean
    isActive?: boolean
    version?: Date
    accCategoryId: number
    balanceByMonth$?: Observable<Balance>
}