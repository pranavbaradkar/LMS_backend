const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SMTP_HOST,
	port: process.env.EMAIL_SMTP_PORT,
	secure: false,
	//secure: process.env.EMAIL_SMTP_SECURE, // lack of ssl commented this. You can uncomment it.
	auth: {
		user: process.env.EMAIL_SMTP_USERNAME,
		pass: process.env.EMAIL_SMTP_PASSWORD
	},
  tls: { rejectUnauthorized: false }
});
let lmsFrom = "edtech@ampersandgroup.in";

exports.send = function (to, subject, html)
{
	// send mail with defined transport object
  // visit https://nodemailer.com/ for more options
  try {
    return transporter.sendMail({
      from: lmsFrom, // sender address e.g. no-reply@xyz.com or "Fred Foo 👻" <foo@example.com>
      to: to, // list of receivers e.g. bar@example.com, baz@example.com
      subject: subject, // Subject line e.g. 'Hello ✔'
      //text: text, // plain text body e.g. Hello world?
      html: html // html body e.g. '<b>Hello world?</b>'
    });
  } catch (err) {
    console.log("mail err.................................", err);
    return ReE(res, err, 422);
  }
};

/* 
mailObject = {
  to: 'send@to.address',
  from: 'from@mail.address',
  subject: 'mail subject',
  html: 'HTML message body',
  attachments: [
      {
        filename: 'my-pdf.pdf',
        path: fs.readFileSync('my-pdf.pdf'),
        contentType: 'application/pdf',
      },
    ],
}
*/
exports.sendWithAttachment = async function (mailObject)
{
	// send mail with defined transport mailObject
  // visit https://nodemailer.com/ for more options
  try {
    mailObject.from = lmsFrom;
    console.log("Sending mail from ", mailObject.attachments);
    await transporter.sendMail(mailObject);
  } catch (err) {
    console.log("mail err.................................", err);
    return ReE(res, err, 422);
  }
};