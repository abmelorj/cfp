export interface AccessGrant {
    id?: number
    agOwnerId: number
    agGrantedUserId: number
    agAccessRuleId: number
    startDate?: Date
    endDate?: Date
    version?: Date
    // agOwner?: User
    // agGrantedUser?: User
    // agAccessRule?: AccessRule
}