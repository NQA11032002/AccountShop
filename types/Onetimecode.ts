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
    ip_details?: IpLocation[];
}

export interface IpLocation {
    ip: string;
    city: string | null;
    region: string | null;
    country: string | null;
    country_code: string | null;
    location: string | null;
}

export interface Onetimecode {
    id: number;
    email: string;
    secret: string;
}
