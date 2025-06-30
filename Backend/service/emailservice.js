const nodemailer = require("nodemailer")

class EmailService {
  constructor() {
    // Fixed: createTransport instead of createTransporter
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password for Gmail
      },
      // Add these for better reliability
      secure: true,
      port: 465,
    })

    // Verify connection on startup
    this.verifyConnection()
  }

  async verifyConnection() {
    try {
      await this.transporter.verify()
      console.log("✅ Email service connected successfully")
    } catch (error) {
      console.error("❌ Email service connection failed:", error.message)
      console.log("Please check your EMAIL_USER and EMAIL_PASS environment variables")
    }
  }

  async sendReminderEmail(user, freebie) {
    const mailOptions = {
      from: `"Freebeez" <${process.env.EMAIL_USER}>`, // Better sender format
      to: user.email,
      subject: `📚 Reminder: ${freebie.title}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 20px;">
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #667eea; margin: 0; font-size: 28px;">📚 Freebeez Reminder</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Don't let this valuable resource slip away!</p>
            </div>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${user.name || "there"},</p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">You wanted to be reminded about this freebie:</p>
            
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 15px; margin: 25px 0; color: white;">
              <h3 style="margin: 0 0 15px 0; font-size: 20px;">${freebie.title}</h3>
              <p style="margin: 0 0 20px 0; opacity: 0.9; line-height: 1.5;">${freebie.description || "A valuable resource waiting for you!"}</p>
              <a href="${freebie.url}" style="background: white; color: #f5576c; padding: 12px 25px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                🚀 Open Resource
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0;">Happy learning! 🌟</p>
              <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">The Freebeez Team</p>
            </div>
          </div>
        </div>
      `,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log(`✅ Reminder email sent to ${user.email}:`, info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("❌ Email sending failed:", error)
      return { success: false, error: error.message }
    }
  }

  async sendWeeklyDigest(user, stats) {
    const mailOptions = {
      from: `"Freebeez" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "📊 Your Weekly Freebeez Summary",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 20px;">
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #667eea; margin: 0; font-size: 28px;">📊 Weekly Summary</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your learning journey this week</p>
            </div>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">Hi ${user.name || "there"},</p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">Here's your Freebeez activity this week:</p>
            
            <div style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); padding: 25px; border-radius: 15px; margin: 25px 0;">
              <h3 style="color: white; margin: 0 0 20px 0; font-size: 20px;">📈 This Week's Stats</h3>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: white;">${stats.collected || 0}</div>
                  <div style="color: rgba(255,255,255,0.9); font-size: 14px;">📥 Collected</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: white;">${stats.opened || 0}</div>
                  <div style="color: rgba(255,255,255,0.9); font-size: 14px;">📖 Opened</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: white;">${stats.completed || 0}</div>
                  <div style="color: rgba(255,255,255,0.9); font-size: 14px;">✅ Completed</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: white;">${stats.completionRate || 0}%</div>
                  <div style="color: rgba(255,255,255,0.9); font-size: 14px;">📈 Completion Rate</div>
                </div>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #666; margin: 0;">Keep up the great work! 🎉</p>
              <p style="color: #999; font-size: 14px; margin: 5px 0 0 0;">The Freebeez Team</p>
            </div>
          </div>
        </div>
      `,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log(`✅ Weekly digest sent to ${user.email}:`, info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("❌ Weekly digest email failed:", error)
      return { success: false, error: error.message }
    }
  }

  // Test email function
  async sendTestEmail(email) {
    const mailOptions = {
      from: `"Freebeez" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🧪 Freebeez Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">🧪 Email Test Successful!</h2>
          <p>If you're reading this, your email service is working correctly.</p>
          <p>Time sent: ${new Date().toLocaleString()}</p>
        </div>
      `,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log(`✅ Test email sent to ${email}:`, info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error("❌ Test email failed:", error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = new EmailService()
