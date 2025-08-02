export class LoginDto {
	email!: string;
	password!: string;
}

export class RegisterDto {
	name!: string;
	email!: string;
	password!: string;
	phone!: string;
}


export class RegisterCustomerDto extends RegisterDto {
	birthDate!: Date;
	gender!: 'male' | 'female';
}
