import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api.js'

export function useDashboard(intervaloMs = 30000) {
  const [totais, setTotais] = useState(null)
  const [ordens, setOrdens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [atualizadoEm, setAtualizadoEm] = useState(null)

  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true)
    try {
      const [t, o] = await Promise.all([api.getDashboardStatus(), api.listOrders()])
      setTotais(t)
      setOrdens(o)
      setAtualizadoEm(t.atualizadoEm)
      setErro('')
    } catch (e) {
      setErro(
        e.response?.status === 403
          ? 'Somente Gestor ou Administrador pode ver o painel.'
          : 'Não foi possível carregar o painel.'
      )
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
    const id = setInterval(() => carregar(true), intervaloMs)
    return () => clearInterval(id)
  }, [carregar, intervaloMs])

  return { totais, ordens, carregando, erro, atualizadoEm, recarregar: () => carregar() }
}