import { Body, Controller, Post, Get, Patch, Delete, Param, Query, 
    NotFoundException, Session, UseGuards
} from '@nestjs/common';
import { User } from './users.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { UserDto } from './dtos/user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from '../guards/auth.guards';
import { Serialize } from '../interceptors/serialize.interceptor';

@Controller('auth')
@Serialize(UserDto)
export class UsersController {
    constructor(private usersService: UsersService, private authService: AuthService){}

    @Get('/whoami')
    @UseGuards(AuthGuard)
    async whoAmI(@CurrentUser() user: User){
        return user
    }

    @Post('/signout')
    signout(@Session() session: any){
        session.userId = null
    }

    @Post('/signup')
    async createUser(@Body() body: CreateUserDto, @Session() session: any){
        const user = await this.authService.signup(body.email, body.password)
        session.userId = user.id
        return user
    }

    @Post('/signin')
    async signin(@Body() body: CreateUserDto, @Session() session: any){
        const user = await this.authService.signin(body.email, body.password)
        session.userId = user.id
        return user
    }

    @Get('/:id')
    async findUser(@Param('id') id: string){
        const user = await this.usersService.findOne(parseInt(id))
        if(!user) throw new NotFoundException('user not found')
        return user
    }

    @Get()
    findAllUsers(@Query('email') email: string){
        return this.usersService.find(email)
    }

    @Patch('/:id')
    updateUser(@Param('id') id: string, @Body() body: UpdateUserDto){
        console.log(body)
        return this.usersService.update(parseInt(id), body)
    }

    @Delete('/:id')
    deleteUser(@Param('id') id: string){
        return this.usersService.remove(parseInt(id))
    }
}
