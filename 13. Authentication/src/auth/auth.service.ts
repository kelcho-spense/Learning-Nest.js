import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { genSalt, hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private JwtService: JwtService,
    private configService: ConfigService,
  ) { }

  private async hashData(data: string): Promise<string> {
    const salt = await genSalt(10);
    return await hash(data, salt);
  }

  private async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      this.JwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.getOrThrow(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
      this.JwtService.signAsync(
        {
          sub: userId,
          email: email,
        },
        {
          secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.getOrThrow(
            'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
          ),
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    return this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    await this.usersRepository.update(userId, { refreshToken });
  }

  // private decodeToken(token: string) {
  //   return this.JwtService.verifyAsync(
  //     token,
  //     this.configService.getOrThrow('JWT_ACCESS_TOKEN_SECRET'),
  //   );
  // }

  async signUpLocal(createAuthDto: CreateAuthDto) {
    // check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createAuthDto.email },
    });
    // if not throw an error
    if (existingUser)
      throw new UnauthorizedException(
        `User with email ${createAuthDto.email} already exists`,
      );
    // hash password & create a user
    const hashedPassword = await this.hashData(createAuthDto.password);
    const user = this.usersRepository.create({
      email: createAuthDto.email,
      password: hashedPassword,
    });
    const newUser = await this.usersRepository.save(user);
    // generate tokens
    const { accessToken, refreshToken } = await this.getTokens(
      newUser.id,
      newUser.email,
    );
    // save refresh token
    await this.saveRefreshToken(newUser.id, refreshToken);
    // return tokens
    return { accessToken, refreshToken };
  }

  async signInLocal(AuthData: CreateAuthDto) {
    // check if user exists
    const foundUser = await this.usersRepository.findOne({
      where: { email: AuthData.email },
    });
    if (!foundUser)
      throw new NotFoundException(
        `User with email ${AuthData.email} not found`,
      );
    // compare hashed password with the password provided
    const passwordMatch = await compare(AuthData.password, foundUser.password);
    // if not throw an error
    if (!passwordMatch) throw new UnauthorizedException('Wrong credentials');
    // if correct generate tokens
    const { accessToken, refreshToken } = await this.getTokens(
      foundUser.id,
      foundUser.email,
    );
    // save refresh token
    await this.saveRefreshToken(foundUser.id, refreshToken);
    // return tokens
    return { accessToken, refreshToken };
  }

  async signOut(userId: string) {
    console.log(userId)
    const response = await this.usersRepository.createQueryBuilder()
      .update(User)
      .set({ refreshToken: null })
      .where('id = :id', { id: userId })
      .execute();

    if (!response.affected) throw new NotFoundException(`User with id ${userId} not found`);
    return { message: 'User signed out successfully' };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    // get user
    const foundUser = await this.usersRepository.findOne({
      where: { id: userId },
    });
    // check if user exists
    if (!foundUser)
      throw new NotFoundException(`User with id ${userId} not found`);
    // compare hashed refresh token with the refresh token provided
    if (!foundUser.refreshToken) throw new UnauthorizedException('Invalid refresh token');
    const refreshTokenMatch = await compare(
      refreshToken,
      foundUser.refreshToken,
    );
    // if not throw an error
    if (!refreshTokenMatch)
      throw new UnauthorizedException('Invalid refresh token');
    // if correct generate tokens
    const { accessToken, refreshToken: newRefreshToken } = await this.getTokens(
      foundUser.id,
      foundUser.email,
    );
    // save refresh token
    await this.updateRefreshToken(foundUser.id, newRefreshToken);
    // return tokens
    return { accessToken, refreshToken };
  }
}
