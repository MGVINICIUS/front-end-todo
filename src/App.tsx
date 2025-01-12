import { Navbar } from './components/navbar'
import Todo from './components/Todo'

const App = () => {
  return (
    <div className='h-full w-full'>
      <Navbar />
      <div className='max-w-3xl mx-auto'>
        <Todo />
      </div>
    </div>
  )
}

export default App
