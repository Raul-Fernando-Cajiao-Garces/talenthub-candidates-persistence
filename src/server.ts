//Caragar las variables del archivo .env.
import 'dotenv/config';

import app from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, ()=>{
    console.log(`Server listening on http://localhost:${PORT}`);
});