import { setSeederFactory } from 'typeorm-extension';
import { User } from '@/modules/users/entities/user.entity';
import { UserRole } from '@via-libre/shared-types';
import * as bcrypt from 'bcryptjs';

export default setSeederFactory(User, (faker) => {
  const user = new User();
  user.fullName = faker.person.fullName();
  user.email = faker.internet.email();
  // We hash the password synchronously for the seeder
  user.password = bcrypt.hashSync('User123!', 10);
  user.phone = faker.phone.number();
  user.role = UserRole.USER;
  user.isActive = true;
  user.isEmailVerified = true;
  return user;
});
