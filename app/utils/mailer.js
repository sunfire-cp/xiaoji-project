const nodemailer = require('nodemailer');
const Exception = require('../exception/exception');
const transporter = nodemailer.createTransport({
    host: 'smtpdm.aliyun.com',
    port: 25,
    secureConnection: true,
    auth: {
        user: 'contact@service.goland.design',
        pass: 'Wsxjw113AS'
    }
});

const sendMail = (rd, email, nickname) => {
    return new Promise(async (resolve, reject) => {
        const mailOptions = {
            from: 'contact@service.goland.design',
            to: email,
            subject: 'Your Confirmation Code - goLand',
            text: `Hi ${nickname}`,
            html: `<HTML><h2 style="color: #2e6c80;">&nbsp;</h2>
            <p>Hi ${nickname}, \nYou have requested a confirmation code and this is your code below.\n${rd}\nRegards,\ngoLand Service Team.</p>
            <p>&nbsp;</p>
            <p>You have requested a confirmation code and this is your code below.</p>
            <p>Please keep it safe.</p>
            <p>&nbsp;</p>
            <p><span style="background-color: #000000; color: #ffffff;"><strong>${rd}</strong></span></p>
            <p>&nbsp;</p>
            <p>If you have some questions about our product, please feel free to contact us.<img src="https://html-online.com/editor/tinymce4_6_5/plugins/emoticons/img/smiley-tongue-out.gif" alt="tongue-out" /></p>
            <table style="background-color: #028080; border-color: #000000; width: 500px; float: left;" border="1">
            <tbody>
            <tr>
            <td><span style="background-color: #008080; color: #ffffff;">Type</span></td>
            <td><span style="background-color: #008080; color: #ffffff;">Address/Number</span></td>
            </tr>
            <tr>
            <td>Email</td>
            <td>service@goland.design</td>
            </tr>
            </tbody>
            </table>
            <h2 style="color: #2e6c80;">&nbsp;</h2>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>Regards,</p>
            <p>goLand Service Team.</p>
            <p><a title="goLand" href="https://www.goland.design" target="_blank" rel="noopener"><img style="float: left;" src="https://xiaoji-web.oss-cn-hangzhou.aliyuncs.com/web/logo.png" alt="" width="101" height="101" /></a></p></HTML>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) reject(error);
            resolve(info.response);
        });
    });
};

module.exports = {
    sendMail
};
