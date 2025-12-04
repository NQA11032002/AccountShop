export interface userOnetimecode {
    id: number;
    id_onetimecode: number;
    email: string;
    name: string;
    ip: string;
    count_logined: string;
    date_logined: string;
    current_date_login: string;
    status: string;
    onetimecode: Onetimecode;
}

export interface Onetimecode {
    id: number;
    email: string;
    secret: string;
}
