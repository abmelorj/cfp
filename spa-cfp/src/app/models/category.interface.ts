export interface Category {
    id?: number
    name: string
    catOwnerId: number
    isCredit: boolean
    isActive?: boolean
    version?: Date
}