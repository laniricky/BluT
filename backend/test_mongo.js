import mongoose from 'mongoose';
const uri = 'mongodb://127.0.0.1:27017/blut_test';
console.log('Attempting to connect to ' + uri);
mongoose.connect(uri).then(() => {
    console.log('✅ Connected successfully');
    process.exit(0);
}).catch(e => {
    console.error('❌ Connection failed:', e.message);
    process.exit(1);
});
