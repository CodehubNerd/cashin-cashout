import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Shield, Phone } from 'lucide-react'
import { useAuth } from '@/lib/AuthContext'

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    phone: '',
    otp: '',
  })

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // login now is provided by AuthContext and will call verify-otp endpoint
      await login(formData.phone, formData.otp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-brand min-h-screen flex items-center justify-center'>
      <Card className='w-full max-w-md mx-auto bg-surface border-outline-full'>
        <CardHeader className='text-center'>
          <div className='flex items-center justify-center mb-4'>
            <Shield className='h-8 w-8 text-accent mr-2' />
            <CardTitle className='text-heading'>Sunrise Portal</CardTitle>
          </div>
          <CardDescription className='text-secondary'>
            Sign in to access your distribution portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='phone' className='text-label'>
                Phone Number
              </Label>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-accent' />
                <Input
                  id='phone'
                  type='tel'
                  placeholder='78123456'
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className='pl-10 border-outline text-brand bg-surface'
                  pattern='78[0-9]{6}'
                  maxLength={8}
                  required
                />
              </div>
              <p className='text-description'>
                8-digit number starting with 78
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='otp' className='text-label'>
                OTP Code
              </Label>
              <Input
                id='otp'
                type='text'
                placeholder='Enter 4-digit OTP'
                value={formData.otp}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    otp: e.target.value.replace(/\D/g, ''),
                  }))
                }
                maxLength={4}
                pattern='[0-9]{4}'
                className='border-outline text-brand bg-surface'
                required
              />
              <p className='text-description'>Any 4-digit code for demo</p>
            </div>

            {error && (
              <div className='text-sm text-red-500 bg-red-50 p-3 rounded-md border-outline'>
                {error}
              </div>
            )}

            <div className='bg-surface p-3 rounded-md border-outline'>
              <p className='text-description font-medium text-accent'>
                Demo Users:
              </p>
              <div className='text-description space-y-1 mt-1 text-brand'>
                <div>78123456 - Distributor (Alex Chen)</div>
                <div>78234567 - Business Staff (Sarah Johnson)</div>
                <div>78345678 - Business Admin (Mike Wilson)</div>
                <div>78456789 - Platform Admin (Emma Davis)</div>
                <div>78567890 - Compliance (David Brown)</div>
              </div>
            </div>

            <Button
              type='submit'
              variant='outline'
              className='button w-full border-outline'
              disabled={isLoading || !formData.phone || !formData.otp}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
