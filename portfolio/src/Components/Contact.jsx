import React, { useState } from 'react';
import emailjs from 'emailjs-com';

function EmailForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();

    const templateParams = {
      to_email: 'omar.maftou0000@gmail.com',
      from_name: name,
      from_email: email,
      subject: 'Message from Portfolio Website',
      message: message,
    };

    emailjs.send('service_4zx58ua', 'template_3zi4w95', templateParams)
      .then((response) => {
        console.log('Email sent successfully:', response);
        setStatus('Email sent successfully');
      })
      .catch((error) => {
        console.log('Email could not be sent:', error);
        setStatus('Email could not be sent');
      });
  };

  return (
    <div className='bg-dark rounded-top py-4'>
        <div className="container justify-content-center">
            <div className="row">
                <div className="col">
                    <h3 className='text-light text-center fw-bold'>Contactez-moi</h3>
                </div>
            </div>
            <form onSubmit={sendEmail}>
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-sm-2">
                        <label htmlFor="name" className='text-light'>Name:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                            className='form-control'
                        />
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-sm-2">
                        <label htmlFor="email" className='text-light'>Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='form-control'
                        />
                    </div>
                </div>
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-sm-2">
                        <label htmlFor="message" className='text-light'>Message:</label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            className='form-control'
                        />
                    </div>
                </div>
                <div className="row mt-1 justify-content-center">
                    <div className="col-lg-6 col-sm-2">
                        <button type="submit" className='btn btn-success form-control text-light py-2'>Envoyer Email</button>
                    </div>
                </div>
        </form>
        {status && <div className="row mt-1 text-center justify-content-center"><div className="col-lg-6 col-sm-3"><div className='alert alert-success form-control'>{status}</div></div></div>}
      </div>
    </div>
  );
}

export default EmailForm;
