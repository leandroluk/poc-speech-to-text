import axios from 'axios';
import { useCallback, useRef, useState } from 'react';
import styles from './App.module.css';

const ERROR_FILE_IS_REQUIRED = 'File is required!'

const KEY = 'app'

function App() {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)
  const [useUpload, setUseUpload] = useState(localStorage.getItem(KEY) === 'true')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const changeUseUpload = () => setUseUpload(prev => {
    const newValue = !prev
    localStorage.setItem(KEY, newValue)
    return newValue
  })

  const onSubmit = useCallback(async e => {
    try {
      setError(null)
      setLoading(true)
      e.preventDefault()
      let result = null
      if (useUpload) {
        if (!inputRef.current.files?.[0]) return setError(ERROR_FILE_IS_REQUIRED)
        const body = new FormData()
        body.append('file', inputRef.current.files?.[0])
        result = await axios.post('http://localhost:3001/upload', body)
        setError(null)
      } else {
        if (!inputRef.current.value) return setError(ERROR_FILE_IS_REQUIRED)
        const body = { uri: new URL(inputRef.current.value).toString() }
        result = await axios.post('http://localhost:3001/uri', body)
        setError(null)
      }
      setResult(result.data)
    } catch (error) {
      setError(error.response.data)
    } finally {
      setLoading(false)
    }
  }, [inputRef, useUpload, setError, setLoading, setResult])

  return (
    <main
      className={styles.root}>
      <h1>Uploader</h1>

      <form
        className={styles.form}
        onSubmit={onSubmit}>
        <div
          className={styles.formControl}>
          <button
            className={styles.formButtonOutline}
            type='button'
            onClick={changeUseUpload}>
            use {useUpload ? 'upload' : 'uri'} method
          </button>
        </div>

        <div className={styles.formControl}>
          <input
            className={styles.formInput}
            ref={inputRef}
            type={useUpload ? "file" : 'url'} />
        </div>

        <div
          className={styles.formControl}>
          <button
            className={styles.formButton}
            type='submit'>
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>

        {error && (
          <pre className={styles.formError}>
            {JSON.stringify(error, null, 2)}
          </pre>
        )}

        {result && (
          <pre className={styles.formSuccess}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </form>
    </main>
  );
}

export default App;
