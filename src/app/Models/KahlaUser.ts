export interface KahlaUser {
    accountCreateTime: Date;
    avatarURL: string;
    bio: string;
    email: string;
    emailConfirmed: boolean;
    iconFilePath: string;
    id: string;
    nickName: string;
    preferedLanguage: string;
    sex: string;
    listInSearchResult: boolean;
    isOnline?: boolean;
}
