// import mailgen from "mailgen";
// import nodemailer from "nodemailer";
// const sendemail = async (options) => {
//   const Mailgenerator = new Mailgen({
//     theme: "default",
//     product: {
//       name: "Task manager",
//       link: "https://taskmanagelink.com",
//     },
//   });
//   const emailtextual = Mailgenerator.generatePLaintext(options.mailgencontent);
//   const emailhtml = Mailgenerator.generatePLaintext(options.mailgencontent);

//   const transporter = nodemailer.createTransport({
//     host: process.env.MAIL_TRAP_SMTP_HOST,
//     port: process.env.MAIL_TRAP_SMTP_PORT,
//     auth: {
//       user: process.env.MAIL_TRAP_SMTP_USR,
//       password: process.env.MAIL_TRAP_SMTP_PASS,
//     },
//   });
//   const mail = {
//     from: "mail.taskmanger@example.com",
//     to: options.mail,
//     subject: options.subject,
//     text: emailtextual,
//     html: emialhtml,
//   };
//   try {
//     await transporter.sendemail(mail);
//   } catch (error) {
//     console.error(
//       "email service failed silently . Make sure you provide all nthe credentials correctly in the .env file ",
//     );
//     console.error("Error", error);
//   }
// };
// const emailverificationMail = (username, verificationurl) => {
//   return {
//     body: {
//       name: username,
//       intor: "welcome to our app we are excited to have you here.",
//       action: {
//         instructions:
//           "To verify your email please click on the following button",
//         button: {
//           color: "#22BC66",
//           text: "verify your email",
//           link: verificationurl,
//         },
//       },
//       outro:
//         "need help, or have question? Just reply to this email, we would love to help",
//     },
//   };
// };

// const forgotpasswordMail = (username, passwordreseturl) => {
//   return {
//     body: {
//       name: username,
//       intor: "welcome got a request to reset the passowrd for your account.",
//       action: {
//         instructions:
//           "to reset your passwored click on the following button for the link",
//         button: {
//           color: "#22BC66",
//           text: "Reset password",
//           link: passowrdreseturl,
//         },
//       },
//       outro:
//         "need help, or have question? Just reply to this email, we would love to help",
//     },
//   };
// };

// export { emailverificationMail, forgotpasswordMail, sendemail };

/*
for clearner version
*/

import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendemail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",

    product: {
      name: "Task Manager",
      link: "https://taskmanagerlink.com",
    },
  });

  // Generate plaintext email
  const emailText = mailGenerator.generatePlaintext(options.mailgencontent);

  // Generate HTML email
  const emailHtml = mailGenerator.generate(options.mailgencontent);

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_TRAP_SMTP_HOST,

    port: process.env.MAIL_TRAP_SMTP_PORT,

    auth: {
      user: process.env.MAIL_TRAP_SMTP_USER,
      pass: process.env.MAIL_TRAP_SMTP_PASS,
    },
  });

  // Mail options
  const mail = {
    from: "mail.taskmanager@example.com",

    to: options.email,

    subject: options.subject,

    text: emailText,

    html: emailHtml,
  };

  try {
    await transporter.sendMail(mail);

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Email service failed. Check your .env credentials.");

    console.error("Error:", error);
  }
};

const emailverificationMail = (username, verificationurl) => {
  return {
    body: {
      name: username,

      intro: "Welcome to our app. We are excited to have you here.",

      action: {
        instructions: "To verify your email please click the button below.",

        button: {
          color: "#22BC66",

          text: "Verify your email",

          link: verificationurl,
        },
      },

      outro: "Need help or have questions? Reply to this email.",
    },
  };
};

const forgotpasswordMail = (username, passwordreseturl) => {
  return {
    body: {
      name: username,

      intro: "We received a request to reset your password.",

      action: {
        instructions: "Click the button below to reset your password.",

        button: {
          color: "#22BC66",

          text: "Reset Password",

          link: passwordreseturl,
        },
      },

      outro: "Need help or have questions? Reply to this email.",
    },
  };
};

export { emailverificationMail, forgotpasswordMail, sendemail };
