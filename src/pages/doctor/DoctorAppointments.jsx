import { useEffect, useMemo, useState } from 'react';
import Topbar from '../../components/Topbar';
import api from '../../utils/api';
import { getSession } from '../../utils/auth';

export default function DoctorAppointments() {
	const session = getSession();

	const [requests, setRequests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedAppt, setSelectedAppt] = useState(null);
	const [showModal, setShowModal] = useState(false);

	const fetchAppts = async () => {
		if (session?.userId) {
			try {
				const data = await api.appointment.getByDoctor(session.userId);
				const mapped = data.map((r) => ({
					...r, // Keep full original object
					id: r.id,
					patientName: r.patient?.name || 'Unknown',
					problem: r.notes || 'No details provided',
					requestedDate: r.appointmentDate,
					status: r.status,
					scheduledTime: r.appointmentTime || '',
					tempTime: '',
				}));
				setRequests(mapped);
			} catch (e) {
				console.error('Failed to load appointments', e);
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		fetchAppts();
		const interval = setInterval(fetchAppts, 10000); // Poll every 30s
		return () => clearInterval(interval);
	}, [session?.userId]);

	const pending = useMemo(
		() => requests.filter((r) => r.status === 'PENDING'),
		[requests],
	);
	const accepted = useMemo(
		() =>
			requests.filter(
				(r) => r.status === 'SCHEDULED' || r.status === 'COMPLETED',
			),
		[requests],
	);
	const rejected = useMemo(
		() => requests.filter((r) => r.status === 'REJECTED'),
		[requests],
	);

	const updateReq = async (id, patch, isSubmit = false) => {
		if (!isSubmit) {
			setRequests((prev) =>
				prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
			);
			return;
		}

		try {
			const req = requests.find((r) => r.id === id);
			const updateData = {};

			if (patch.status === 'SCHEDULED') {
				updateData.status = 'SCHEDULED';
				updateData.appointmentTime = req.tempTime;
				updateData.appointmentDate = req.requestedDate;
			} else if (patch.status === 'REJECTED') {
				updateData.status = 'REJECTED';
				updateData.appointmentDate = req.requestedDate;
				updateData.appointmentTime = null;
			} else if (patch.status === 'COMPLETED') {
				updateData.status = 'COMPLETED';
				updateData.appointmentDate = req.requestedDate;
				updateData.appointmentTime = req.scheduledTime;
			}

			await api.appointment.update(id, updateData);
			alert(`Request ${patch.status.toLowerCase()} successfully!`);
			fetchAppts();
		} catch (e) {
			alert('Failed to update appointment: ' + e.message);
		}
	};

	const openDetails = (r) => {
		setSelectedAppt(r);
		setShowModal(true);
	};

	if (loading) return <div className='p-4'>Loading appointments...</div>;

	return (
		<div className='container'>
			<Topbar
				title={<>Doctor Appointments</>}
				subtitle={`Manage patient requests • ${session?.email || ''}`}
				searchPlaceholder='Search patient requests...'
			/>

			<div className='apptStats'>
				<div className='card statCard'>
					<div className='statK'>Pending</div>
					<div className='statV'>{pending.length}</div>
				</div>
				<div className='card statCard'>
					<div className='statK'>Accepted</div>
					<div className='statV'>{accepted.length}</div>
				</div>
				<div className='card statCard'>
					<div className='statK'>Rejected</div>
					<div className='statV'>{rejected.length}</div>
				</div>
				<div className='card statCard'>
					<div className='statK'>Doctor</div>
					<div className='statV'>{session?.name || 'Doctor'}</div>
				</div>
			</div>

			<div className='list'>
				{requests.length === 0 && (
					<div className='text-gray-500'>
						No appointment requests found.
					</div>
				)}
				{requests.map((r) => (
					<div key={r.id} className='card apptCard'>
						<div className='apptLeft'>
							<div className='apptDate'>
								<div className='apptDay'>
									{String(r.id).padStart(2, '0')}
								</div>
								<div className='apptMon'>REQ</div>
							</div>

							<div className='apptInfo'>
								<div className='apptTitle'>{r.patientName}</div>
								<div className='apptSub'>{r.problem}</div>
								<div className='apptMeta'>
									📅 Requested: {r.requestedDate}
								</div>

								{r.status === 'SCHEDULED' ? (
									<div className='apptMeta'>
										🕒 Scheduled:{' '}
										{r.scheduledTime?.slice(0, 5)}
									</div>
								) : null}
							</div>
						</div>

						<div className='apptRight'>
							<div
								className={`apptStatus ${r.status.toLowerCase()}`}
							>
								{r.status}
							</div>

							{r.status === 'PENDING' ? (
								<div
									className='apptBtns'
									style={{ flexWrap: 'wrap' }}
								>
									<input
										className='input'
										type='time'
										style={{ width: 140, padding: 10 }}
										value={r.tempTime || ''}
										onChange={(e) =>
											updateReq(r.id, {
												tempTime: e.target.value,
											})
										}
									/>
									<button
										className='btn'
										onClick={() => {
											if (!r.tempTime) {
												alert('Please select a time');
												return;
											}
											updateReq(
												r.id,
												{ status: 'SCHEDULED' },
												true,
											);
										}}
									>
										Accept
									</button>
									<button
										className='btn ghost'
										onClick={() =>
											updateReq(
												r.id,
												{ status: 'REJECTED' },
												true,
											)
										}
									>
										Reject
									</button>
									<button
										className='btn ghost'
										onClick={() => openDetails(r)}
									>
										Details
									</button>
								</div>
							) : (
								<div className='apptBtns'>
									{r.status === 'SCHEDULED' && (
										<button
											className='btn'
											style={{ background: '#059669' }}
											onClick={() => {
												if (
													window.confirm(
														'Mark this consultation as completed?',
													)
												) {
													updateReq(
														r.id,
														{ status: 'COMPLETED' },
														true,
													);
												}
											}}
										>
											Complete
										</button>
									)}
									<button
										className='btn ghost'
										onClick={() => openDetails(r)}
									>
										View Details
									</button>
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{showModal && selectedAppt && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0,0,0,0.5)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000,
					}}
				>
					<div className='card' style={{ width: 450, padding: 24 }}>
						<div className='panelTitle'>Patient Details</div>
						<div className='panelSub'>
							Case Reference: #{selectedAppt.id}
						</div>

						<div style={{ marginTop: 20 }}>
							<div className='panelMain'>
								{selectedAppt.patientName}
							</div>
							<div className='panelSub'>
								{selectedAppt.patient?.email}
							</div>
							<div className='panelSub' style={{ fontSize: 12 }}>
								City: {selectedAppt.patient?.city}
							</div>

							<div
								className='card'
								style={{
									padding: 12,
									marginTop: 14,
									background: '#f9fbff',
								}}
							>
								<div className='label'>Visit Reason</div>
								<div
									className='panelSub'
									style={{
										color: '#1f2a44',
										fontStyle: 'italic',
									}}
								>
									"{selectedAppt.problem}"
								</div>
							</div>

							<div className='summary' style={{ marginTop: 14 }}>
								<div className='summaryItem'>
									<div className='k'>Weight</div>
									<div className='v'>
										{selectedAppt.patient?.weight || '--'}{' '}
										kg
									</div>
								</div>
								<div className='summaryItem'>
									<div className='k'>Height</div>
									<div className='v'>
										{selectedAppt.patient?.height || '--'}{' '}
										cm
									</div>
								</div>
								<div className='summaryItem'>
									<div className='k'>Blood Pressure</div>
									<div className='v'>
										{selectedAppt.patient?.bloodPressure ||
											'--'}
									</div>
								</div>
								<div className='summaryItem'>
									<div className='k'>Heart Rate</div>
									<div className='v'>
										{selectedAppt.patient?.heartRate ||
											'--'}{' '}
										bpm
									</div>
								</div>
							</div>
						</div>

						<div
							style={{
								marginTop: 24,
								display: 'flex',
								gap: 10,
								justifyContent: 'flex-end',
							}}
						>
							<button
								className='btn'
								onClick={() => setShowModal(false)}
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			<div className='card' style={{ marginTop: 14 }}>
				<div className='panelTitle'>Doctor's Guide</div>
				<div className='panelSub' style={{ lineHeight: '1.6' }}>
					• Select a time and <b>Accept</b> to schedule the visit.
					<br />• Use <b>Details</b> to check patient vitals and visit
					reason.
					<br />• Go to <b>Reports</b> section after consultation to
					add prescriptions.
				</div>
			</div>
		</div>
	);
}
