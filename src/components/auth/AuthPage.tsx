'use client'

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
import { Phone, Shield } from 'lucide-react'
import logoSun from '@/assets/logos/logo2.svg'
import axios from 'axios'
import { useAuth } from '@/lib/AuthContext'
import { useNavigate } from 'react-router-dom'

export const AUTH_URL = 'https://api.agents.centurionbd.com'

export default function AuthPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const { login, sessionToken, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  if (authLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4 bg-brand'>
        <p className='text-secondary'>Loading...</p>
      </div>
    )
  }

  if (sessionToken) {
    return null
  }

  const handleSendOTP = async () => {
    if (!phone || phone.length < 8) {
      alert('Please enter a valid phone number')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(
        `${AUTH_URL}/v1/cico/agents/auth/request-otp`,
        {
          phone_number: phone,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      console.log(res)

      setStep('otp')
      alert('OTP Sent')
    } catch {
      alert('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert('Enter the 6-digit code sent to your phone')
      return
    }

    setLoading(true)
    try {
      // Use centralized login from AuthContext
      await login(phone, otp)

      alert('OTP verified successfully')
      navigate('/')
    } catch (err) {
      console.error(err)
      alert('Login Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='rounded-lg p-6 w-full max-w-md space-y-8'>
        <Card className='bg-surface border shadow-2xl text-brand border-outline'>
          <CardHeader className='text-center'>
            <div className='text-center'>
              <div className='flex items-center justify-center mb-4'>
                <div className='rounded-sm p-3'>
                  <img alt='logo' src={logoSun} width={200} height={100} />
                </div>
              </div>
            </div>
            <CardTitle className='flex items-center justify-center gap-2'>
              {step === 'phone' ? (
                <Phone className='h-5 w-5' />
              ) : (
                <Shield className='h-5 w-5' />
              )}
              {step === 'phone' ? 'Sign In' : 'Verify OTP'}
            </CardTitle>
            <CardDescription className='text-gray-300'>
              {step === 'phone'
                ? 'Enter your phone number to get started'
                : 'Enter the 6-digit code sent to your phone'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {step === 'phone' ? (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='7XXX XXXX'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='text-center'
                  />
                </div>
                <Button
                  onClick={handleSendOTP}
                  className='w-full button font-semibold'
                  disabled={loading}
                  variant={'outline'}
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </>
            ) : (
              <>
                <div className='space-y-2'>
                  <Label htmlFor='otp'>Verification Code</Label>
                  <Input
                    id='otp'
                    type='text'
                    placeholder='000000'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className='text-center text-2xl tracking-widest'
                    maxLength={6}
                  />
                </div>
                <div className='flex gap-2'>
                  <Button
                    variant='secondary'
                    onClick={() => setStep('phone')}
                    className='flex-1'
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleVerifyOTP}
                    className='flex-1 button font-semibold'
                    disabled={loading}
                    variant={'outline'}
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
