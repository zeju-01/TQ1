const bcrypt = require('bcryptjs');

async function checkPassword() {
  const passwords = ['123456', 'admin', 'password', '12345678', 'Admin123', 'admin123', 'Admin@123', '123456789'];
  const hash = '$2b$10$I.J4ypcryNdjnEJlH7jZIOfxaVMG8jzmAlzbgSfVbIo9fiEOy53qa';
  
  for (const pwd of passwords) {
    const result = await bcrypt.compare(pwd, hash);
    console.log(`${pwd}: ${result}`);
  }
}

checkPassword();