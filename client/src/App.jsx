import { useState, useEffect } from 'react'
import Filter from './component/Filter'
import PersonForm from './component/PersonForm'
import Persons from './component/Persons'
import personsService from './service/persons'
import Alert from './component/Alert'

const App = () => {
  const [persons, setPersons] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState(null)

  useEffect(() => {
    personsService.getAll()
      .then(data => {
        setPersons(data)
      })
  }, [])

  function showMessage(text, type) {
    setMessage({ text, type })
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  const onAddNewPersonClick = (data, reset) => {
    const sameIndex = persons.findIndex(person => person.name === data.name)
    if (sameIndex !== -1) {
      if (window.confirm(`Person with name '${data.name}' is already added to phonebook, replace the old number with the new one ?`)) {
        personsService.update(persons[sameIndex].id, data)
          .then(data => {
            showMessage(`Person '${data.name}' is successfully updated`, 'success')
            const newPersons = persons.filter(person => person.id !== data.id)
            setPersons([...newPersons, data])
            reset()
          })
          .catch(error => {
            if (error.response.status === 404) {
              showMessage(`Person '${data.name}' was already removed from server`, 'error')
              const newPersons = persons.filter(person => person.id !== persons[sameIndex].id)
              setPersons(newPersons)
            } else {
              showMessage(error.response.data.error, 'error')
            }
          })
      }
    } else {
      personsService.create(data)
        .then(data => {
          showMessage(`Person '${data.name}' is successfully added`, 'success')
          setPersons([...persons, data])
          reset()
        })
        .catch(error => {
          showMessage(error.response.data.error, 'error')
        })
    }
  }

  const onDeleteButtonClick = (data) => {
    if (window.confirm(`Delete ${data.name} ?`)) {
      personsService.remove(data.id)
        .then(_ => {
          showMessage(`Person'${data.name}' is successfully deleted`, 'success')
          const newPersons = persons.filter(person => person.id !== data.id)
          setPersons(newPersons)
        })
    }
  }

  return (
    <div className='mx-[auto] p-4 md:w-1/2'>
      <h1 className='text-3xl font-bold text-white'>Phonebook</h1>
      <Alert message={message} />
      <h2 className='mt-8 text-xl font-bold text-white'>Add a new person</h2>
      <PersonForm onSubmit={onAddNewPersonClick} />
      <h2 className='mt-8 text-xl font-bold text-white'>Numbers</h2>
      <Filter search={search} setSearch={setSearch} />
      <Persons persons={persons} search={search} onDeleteButtonClick={onDeleteButtonClick} />
    </div>
  )
}

export default App