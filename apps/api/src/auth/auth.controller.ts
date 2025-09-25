import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiProperty, ApiTags } from '@nestjs/swagger';

class SignupDto {
    @ApiProperty({ example: 'john@acme.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'pass1234' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    name?: string;
}

class LoginDto {
    @ApiProperty({ example: 'john@acme.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'pass1234' })
    @IsString()
    password: string;
}

class LoginResponseDto {
    @IsString() accessToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('signup')
    @ApiBody({ type: SignupDto })
    @ApiOkResponse({ type: LoginResponseDto })
    async signup(@Body() dto: SignupDto): Promise<LoginResponseDto> {
        const token = (await this.auth.signup(dto.email, dto.password, dto.name)).accessToken;
        return { accessToken: token };
    }

    @Post('login')
    @ApiBody({ type: LoginDto })
    @ApiOkResponse({ type: LoginResponseDto })
    async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
        const token = (await this.auth.login(dto.email, dto.password)).accessToken;
        return { accessToken: token };
    }
}
