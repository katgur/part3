require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')
const Person = require('./model/person')

const app = express()

// middleware
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
morgan.token('body', req => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
})
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

// routes
app.get('/api/persons', (request, response, next) => {
    Person.find({})
        // new Promise(() => {
        //     throw new Error('kek')
        // })
        .then(result => {
            response.json(result)
            mongoose.connection.close()
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(result => {
            if (result) {
                response.json(result)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if (!body) {
        return response.status(400).json({ error: 'body missing' })
    }

    if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    }

    if (!body.number) {
        return response.status(400).json({ error: 'number missing' })
    }

    const name = body.number
    const number = body.number

    const person = new Person({
        name: name,
        number: number,
    })

    person.save()
        .then(result => {
            response.status(201).json(person)
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    if (!body) {
        return response.status(400).json({ error: 'body missing' })
    }

    if (!body.name) {
        return response.status(400).json({ error: 'name missing' })
    }

    if (!body.number) {
        return response.status(400).json({ error: 'number missing' })
    }

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person)
        .then(result => {
            if (result) {
                response.json(result)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndRemove(id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    Person.count({})
        .then(result => {
            const info = `Phonebook has info for ${result} people`
            const timestamp = new Date()
            response.send(
                `<div>${info}<br/>${timestamp}</div>`
            )
        })
        .catch(error => next(error))
})

function errorHandler(error, request, response, next) {
    console.error(error)

    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id' })
    } else {
        response.status(500).end()
    }

    next()
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})