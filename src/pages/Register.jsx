import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession, getSession, register } from '../utils/auth';

export default function Register() {
	const [role, setRole] = useState('PATIENT');
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [pass, setPass] = useState('');
	const [city, setCity] = useState('');
	const [spec, setSpec] = useState('');
	const [clinic, setClinic] = useState('');
	const [address, setAddress] = useState('');
	const [phone, setPhone] = useState('');
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

	async function handleRegister(e) {
		e.preventDefault();
		setMsg('');

		try {
			const userData = {
				email,
				password: pass,
				name,
				role,
				city,
			};

			if (role === 'DOCTOR') {
				userData.specialty = spec;
				userData.clinic = clinic;
				userData.address = address;
				userData.phone = phone;
				userData.distance = '0 km';
			}

			const session = await register(userData);

			// Force logout so user has to login manually
			// Use clearSession since we want to redirect to login page
			// And Login page will auto-redirect if session exists
			clearSession();

			if (session.role === 'DOCTOR') {
				setMsg(
					'Doctor account created! Pending admin approval. Redirecting to login...',
				);
			} else {
				setMsg('Registration successful! Redirecting to login...');
			}

			setTimeout(() => nav('/login'), 2000);
		} catch (error) {
			setMsg(error.message || 'Registration failed. Please try again.');
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

				<div className='authTitle'>Create Account</div>

				<div className='roleTabs'>
					<button
						className={`roleTab ${role === 'PATIENT' ? 'active' : ''}`}
						onClick={() => setRole('PATIENT')}
						type='button'
					>
						Patient
					</button>
					<button
						className={`roleTab ${role === 'DOCTOR' ? 'active' : ''}`}
						onClick={() => setRole('DOCTOR')}
						type='button'
					>
						Doctor
					</button>
				</div>

				<form className='authForm' onSubmit={handleRegister}>
					<div>
						<div className='label'>Full Name</div>
						<input
							className='input'
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='Your name'
							required
						/>
					</div>

					<div>
						<div className='label'>Email</div>
						<input
							className='input'
							type='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder='example@mail.com'
							required
						/>
					</div>

					<div>
						<div className='label'>City</div>
						<input
							className='input'
							value={city}
							onChange={(e) => setCity(e.target.value)}
							placeholder='Dhaka'
							required
						/>
					</div>

					{role === 'DOCTOR' ? (
						<>
							<div>
								<div className='label'>Specialization</div>
								<input
									className='input'
									value={spec}
									onChange={(e) => setSpec(e.target.value)}
									placeholder='e.g., Cardiology'
									required
								/>
							</div>
							<div>
								<div className='label'>Clinic/Hospital</div>
								<input
									className='input'
									value={clinic}
									onChange={(e) => setClinic(e.target.value)}
									placeholder='e.g., Square Hospital'
									required
								/>
							</div>
							<div>
								<div className='label'>Clinic Address</div>
								<input
									className='input'
									value={address}
									onChange={(e) => setAddress(e.target.value)}
									placeholder='Full street address'
									required
								/>
							</div>
							<div>
								<div className='label'>Contact Number</div>
								<input
									className='input'
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder='+8801...'
									required
								/>
							</div>
						</>
					) : null}

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
						Register
					</button>

					<div className='authHint'>
						Already have an account?{' '}
						<button
							type='button'
							className='linkBtn'
							onClick={() => nav('/login')}
						>
							Login
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
