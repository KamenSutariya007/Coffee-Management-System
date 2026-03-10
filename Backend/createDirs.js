const fs = require('fs');
const path = require('path');

// Define the directories to create
const directories = [
  path.join(__dirname, 'public/images/products'),
  path.join(__dirname, 'public/images/blogs')
];

// Create each directory if it doesn't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('Directory structure is ready!');
