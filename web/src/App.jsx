import { useCallback, useRef, useState } from 'react';
import styles from './App.module.css';

const ERROR_FILE_IS_REQUIRED = 'File is required!'

function App() {
  const uploadRef = useRef(null)
  const uriRef = useRef(null)
  const [error, setError] = useState(null)
  const [useUpload, setUseUpload] = useState(true)

  const onSubmitUpload = useCallback(async e => {
    try {
      setError(null)
      e.preventDefault()
      if (!uploadRef.current.files?.[0]) return setError(ERROR_FILE_IS_REQUIRED)
      const file = uploadRef.current.files?.[0]
      const body = new FormData()
      body.append('file', file)
      await fetch('http://localhost:3001/upload', { method: 'POST', body })
      setError(null)
    } catch (error) {
      setError(error.message)
    }
  }, [uploadRef, setError])

  const onSubmitUri = useCallback(async e => {
    try {
      setError(null)
      e.preventDefault()
      if (!uriRef.current.value) return setError(ERROR_FILE_IS_REQUIRED)
      const body = { uri: new URL(uriRef.current.value).toString() }
      await fetch('http://localhost:3001/uri', { method: 'POST', body })
      setError(null)
    } catch (error) {
      setError(error.message)
    }
  }, [uriRef, setError])

  const onSubmit = (e) => useUpload ? onSubmitUpload(e) : onSubmitUri(e)

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
            onClick={() => setUseUpload(prev => !prev)}>
            use {useUpload ? 'upload' : 'uri'} method
          </button>
        </div>

        <div className={styles.formControl}>
          <input
            className={styles.formInput}
            ref={uploadRef}
            type={useUpload ? "file" : 'url'} />
        </div>

        <div
          className={styles.formControl}>
          <button
            className={styles.formButton}
            type='submit'>
            Submit
          </button>
        </div>

        {error && <div className={styles.formError}>{error}</div>}
      </form>
    </main>
  );
}

export default App;
