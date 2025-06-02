export interface LoginDto {
	email: string;
	password: string;
	role: string;
}

export interface RegisterDto {
	name: string;
	email: string;
	password: string;
	phone?: string;
	userTypeId: number;
}
