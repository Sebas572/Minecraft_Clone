import colors from 'colors'
import path from 'path'
import express from 'express'
import morgan from 'morgan'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const app = express();

app.use(morgan('dev'));
app.use('/public', express.static('./src/public/'));

app.set('views', path.resolve(__dirname, 'views'))

app.get('/', (req, res, next) => {
	res.render('game.ejs');
})

app.listen(3000, () => {
	console.log(colors.bold(colors.green(`Start server in port 3000`)));
});