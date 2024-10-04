const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let min, max, targetNumber, currentGuess;

app.use(express.static(__dirname)); 

io.on('connection', (socket) => {
    console.log("Клиент подключен...");

    socket.on('startGame', (range) => {
        min = range.min;
        max = range.max;
        targetNumber = range.targetNumber; 
        currentGuess = Math.floor(Math.random() * (max - min + 1)) + min; 

        console.log(`Начата игра с диапазоном: от ${min} до ${max} и загаданным числом: ${targetNumber}`);
        
        guessNumber(socket);
    });

    socket.on('hint', (hint) => {
        console.log(`Получена подсказка от клиента: ${hint}`);
        
        if (hint === "more") {
           
            currentGuess = Math.floor(Math.random() * (max - currentGuess)) + currentGuess + 1; 
        } else if (hint === "less") {
           
            currentGuess = Math.floor(Math.random() * (currentGuess - min)) + min; 
        }
        
        
        if (currentGuess < min || currentGuess > max) {
            socket.emit('gameResult', { message: "Ошибка! Предположение вне диапазона." });
            return;
        }

        guessNumber(socket);
    });
});

function guessNumber(socket) {
    socket.emit('serverGuess', { guess: currentGuess });

    console.log(`Сервер предполагает число: ${currentGuess}`);

   
    if (currentGuess === targetNumber) {
        socket.emit('gameResult', { message: `Сервер угадал число ${currentGuess}! Игра окончена.` });
        console.log(`Игра окончена. Сервер угадал число: ${currentGuess}`);
    }
}

server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
