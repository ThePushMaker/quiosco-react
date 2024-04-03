import {useEffect} from "react"
import useSWR from "swr"
import { useNavigate } from "react-router-dom"
import clienteAxios from "../config/axios"
export const useAuth = ({middleware, url}) => {
  
  const token = localStorage.getItem('AUTH_TOKEN')
  const navigate = useNavigate()
  
  const {data: user, error, mutate} = useSWR('/user', () => 
    clienteAxios('/user', {
      headers: { 
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.data)
    .catch(error => {
      throw Error(error?.response?.data?.errors)
    })
  )
  
  const login = async (datos, setErrores) => {
    try {
      const {data} = await clienteAxios.post('/login', datos)
      localStorage.setItem('AUTH_TOKEN', data.token)
      setErrores([])
      await mutate()
    } catch (error) {
      setErrores(Object.values(error.response.data.errors))
    }
  }
  const registro = () => {
    
  }
  const logout = async () => {
    try {
      await clienteAxios.post('/logout', null, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      })
      localStorage.removeItem('AUTH_TOKEN')
      // esto es porque useSWR cachea un poco, con undefined lo limpiamos al instante
      await mutate(undefined)
    } catch (error) {
     throw Error(error?.response?.data?.errors) 
    }
  }
  
  console.log(user)
  console.log(error)
  
  useEffect(() => {
    if(middleware === 'guest' && url && user){
      navigate(url)
    }
    
    // no hemos iniciado sesión
    if(middleware === 'auth' && error){
      navigate('/auth/login')
    }
    
  }, [user, error])
  
  return {
    login,
    registro,
    logout,
    user,
    error
  }
}