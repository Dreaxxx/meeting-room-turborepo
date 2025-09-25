import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../user/user.service';
import { AuthController } from './auth.controller';
import { JwtAuth } from './jwt.auth';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET!,
            signOptions: { expiresIn: '7d' },
        }),
    ],
    providers: [AuthService, UsersService, PrismaService, JwtAuth],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
