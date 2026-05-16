import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, login } from '../utils/auth';

export default function Login() {
	const [email, setEmail] = useState('');
	const [pass, setPass] = useState('');
	const [msg, setMsg] = useState('');
	const nav = useNavigate();

	useEffect(() => {
		const s = getSession();
		if (s) {
			if (s.role === 'ADMIN') nav('/admin', { replace: true });
			else if (s.role === 'DOCTOR')
				nav('/doctor/dashboard', { replace: true });
			else nav('/p/home', { replace: true });
		}
	}, [nav]);

	async function handleLogin(e) {
		e.preventDefault();
		setMsg('');

		try {
			const session = await login(email, pass);

			// Navigate based on role
			if (session.role === 'ADMIN') {
				nav('/admin', { replace: true });
			} else if (session.role === 'DOCTOR') {
				nav('/doctor/dashboard', { replace: true });
			} else {
				nav('/p/home', { replace: true });
			}
		} catch (error) {
			let message =
				error.message || 'Login failed. Please check your credentials.';
			if (message.includes('pending approval')) {
				message =
					'Login blocked: Your account is pending Admin approval. Please wait for verification.';
			}
			setMsg(message);
		}
	}

	return (
		<div className='authWrap'>
			<div className='authCard'>
				<div className='authHeader'>
					<div className='authLogo'>+</div>
					<div>
						<div className='authBrand'>MediLink+</div>
						<div className='authTag'>
							Secure healthcare, faster.
						</div>
					</div>
				</div>

				<div className='authTitle'>Login</div>

				<form className='authForm' onSubmit={handleLogin}>
					<div>
						<div className='label'>Email</div>
						<input
							className='input'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='example@mail.com'
							required
						/>
					</div>

					<div>
						<div className='label'>Password</div>
						<input
							className='input'
							type='password'
							value={pass}
							onChange={(e) => setPass(e.target.value)}
							placeholder='********'
							required
						/>
					</div>

					{msg ? <div className='authMsg'>{msg}</div> : null}

					<button
						className='btn'
						type='submit'
						style={{ width: '100%' }}
					>
						Login
					</button>

					<div className='authHint'>
						Don’t have an account?{' '}
						<button
							type='button'
							className='linkBtn'
							onClick={() => nav('/register')}
						>
							Register
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
