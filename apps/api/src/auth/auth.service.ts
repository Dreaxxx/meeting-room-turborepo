import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(private users: UsersService, private jwt: JwtService) { }

    async signup(email: string, password: string, name?: string) {
        const exists = await this.users.findByEmail(email);
        if (exists) throw new ConflictException('Email already used');
        const hash = await argon2.hash(password);
        const user = await this.users.create({ email, password: hash, name });
        return this.sign(user.id, user.email);
    }

    async login(email: string, password: string) {
        const user = await this.users.findByEmail(email);
        if (!user || !(await argon2.verify(user.password, password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.sign(user.id, user.email);
    }

    private sign(sub: string, email: string) {
        const accessToken = this.jwt.sign({ sub, email });
        return { accessToken, user: { id: sub, email } };
    }
}
