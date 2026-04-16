const { Resend } = require('resend');

// Debug: Check if API key is loaded
if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  WARNING: RESEND_API_KEY is not set in environment variables!');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'onboarding@resend.dev'; // Use Resend's test email if EMAIL_FROM not set

/**
 * Send booking confirmation email
 * @param {string} hostEmail - Host (meeting organizer) email
 * @param {string} hostName - Host name
 * @param {string} guestEmail - Guest (booker) email
 * @param {string} guestName - Guest name
 * @param {string} eventName - Event/meeting type name
 * @param {string} description - Event description
 * @param {string} startTime - Meeting start time (ISO format)
 * @param {string} endTime - Meeting end time (ISO format)
 * @returns {Promise<Object>} Email send result with delivery status
 */
exports.sendBookingConfirmation = async (hostEmail, hostName, guestEmail, guestName, eventName, description, startTime, endTime) => {
    const result = {
        guestEmail: guestEmail,
        hostEmail: hostEmail,
        success: false,
        guestEmailSent: false,
        hostEmailSent: false,
        messages: []
    };

    try {
        console.log(`📧 Starting email service for booking: ${guestName} -> ${hostName}`);
        
        // Send email to guest
        try {
            console.log(`📬 Sending confirmation email to guest: ${guestEmail} from ${FROM_EMAIL}`);
            const guestResponse = await resend.emails.send({
                from: FROM_EMAIL,
                to: guestEmail,
                subject: `Booking Confirmation: ${eventName}`,
                html: generateBookingConfirmationEmailHtml(
                    guestName,
                    hostName,
                    eventName,
                    description,
                    startTime,
                    endTime
                )
            });

            console.log('🔍 Guest email response:', JSON.stringify(guestResponse, null, 2));

            // Check if response has id or error
            if (guestResponse.error) {
                result.messages.push(`✗ Failed to send email to guest ${guestEmail}: ${guestResponse.error.message}`);
                console.error('❌ Guest email error:', guestResponse.error);
            } else if (guestResponse.data?.id) {
                result.guestEmailSent = true;
                result.messages.push(`✓ Confirmation email sent to guest: ${guestEmail}`);
                console.log(`✅ Guest email sent successfully (ID: ${guestResponse.data.id})`);
            } else if (guestResponse.id) {
                // Alternative response structure
                result.guestEmailSent = true;
                result.messages.push(`✓ Confirmation email sent to guest: ${guestEmail}`);
                console.log(`✅ Guest email sent successfully (ID: ${guestResponse.id})`);
            } else {
                result.messages.push(`⚠️ Unexpected response for guest email: ${JSON.stringify(guestResponse)}`);
                console.warn('⚠️ Unexpected guest email response:', guestResponse);
            }
        } catch (guestError) {
            result.messages.push(`✗ Failed to send email to guest ${guestEmail}: ${guestError.message}`);
            console.error('❌ Guest email exception:', guestError);
        }

        // Send email to host with guest info
        try {
            console.log(`📬 Sending booking notification email to host: ${hostEmail} from ${FROM_EMAIL}`);
            const hostResponse = await resend.emails.send({
                from: FROM_EMAIL,
                to: hostEmail,
                subject: `New Booking: ${eventName} - ${new Date(startTime).toLocaleDateString()}`,
                html: generateBookingNotificationEmailHtml(
                    hostName,
                    guestName,
                    guestEmail,
                    eventName,
                    description,
                    startTime,
                    endTime,
                    result.guestEmailSent
                )
            });

            console.log('🔍 Host email response:', JSON.stringify(hostResponse, null, 2));

            if (hostResponse.error) {
                result.messages.push(`✗ Failed to send notification to host ${hostEmail}: ${hostResponse.error.message}`);
                console.error('❌ Host email error:', hostResponse.error);
            } else if (hostResponse.data?.id) {
                result.hostEmailSent = true;
                result.messages.push(`✓ Booking notification sent to host: ${hostEmail}${result.guestEmailSent ? '' : ' (Guest email delivery failed - details included)'}`);
                console.log(`✅ Host email sent successfully (ID: ${hostResponse.data.id})`);
            } else if (hostResponse.id) {
                // Alternative response structure
                result.hostEmailSent = true;
                result.messages.push(`✓ Booking notification sent to host: ${hostEmail}${result.guestEmailSent ? '' : ' (Guest email delivery failed - details included)'}`);
                console.log(`✅ Host email sent successfully (ID: ${hostResponse.id})`);
            } else {
                result.messages.push(`⚠️ Unexpected response for host email: ${JSON.stringify(hostResponse)}`);
                console.warn('⚠️ Unexpected host email response:', hostResponse);
            }
        } catch (hostError) {
            result.messages.push(`✗ Failed to send notification to host ${hostEmail}: ${hostError.message}`);
            console.error('❌ Host email exception:', hostError);
        }

        result.success = result.guestEmailSent && result.hostEmailSent;
        console.log(`📊 Booking confirmation result: Success=${result.success}, Guest=${result.guestEmailSent}, Host=${result.hostEmailSent}`);
    } catch (error) {
        result.messages.push(`✗ Unexpected error in booking confirmation: ${error.message}`);
        console.error('❌ Unexpected error:', error);
    }

    return result;
};

/**
 * Send booking cancellation email
 * @param {string} hostEmail - Host email
 * @param {string} hostName - Host name
 * @param {string} guestEmail - Guest email
 * @param {string} guestName - Guest name
 * @param {string} eventName - Event/meeting type name
 * @param {string} startTime - Meeting start time (ISO format)
 * @param {string} endTime - Meeting end time (ISO format)
 * @returns {Promise<Object>} Email send result with delivery status
 */
exports.sendCancellationNotification = async (hostEmail, hostName, guestEmail, guestName, eventName, startTime, endTime) => {
    const result = {
        guestEmail: guestEmail,
        hostEmail: hostEmail,
        success: false,
        guestEmailSent: false,
        hostEmailSent: false,
        messages: []
    };

    try {
        // Send cancelation email to guest
        try {
            const guestResponse = await resend.emails.send({
                from: FROM_EMAIL,
                to: guestEmail,
                subject: `Booking Cancelled: ${eventName}`,
                html: generateCancellationEmailHtml(
                    guestName,
                    hostName,
                    eventName,
                    startTime
                )
            });

            if (guestResponse.data?.id) {
                result.guestEmailSent = true;
                result.messages.push(`✓ Cancellation email sent to guest: ${guestEmail}`);
            }
        } catch (guestError) {
            result.messages.push(`✗ Failed to send cancellation email to guest ${guestEmail}: ${guestError.message}`);
        }

        // Send cancellation notification to host
        try {
            const hostResponse = await resend.emails.send({
                from: FROM_EMAIL,
                to: hostEmail,
                subject: `Booking Cancelled: ${eventName} - ${new Date(startTime).toLocaleDateString()}`,
                html: generateCancellationNotificationEmailHtml(
                    hostName,
                    guestName,
                    eventName,
                    startTime
                )
            });

            if (hostResponse.data?.id) {
                result.hostEmailSent = true;
                result.messages.push(`✓ Cancellation notification sent to host: ${hostEmail}`);
            }
        } catch (hostError) {
            result.messages.push(`✗ Failed to send cancellation notification to host ${hostEmail}: ${hostError.message}`);
        }

        result.success = result.guestEmailSent && result.hostEmailSent;
    } catch (error) {
        result.messages.push(`✗ Unexpected error in cancellation notification: ${error.message}`);
    }

    return result;
};

/**
 * Send booking reschedule notification
 * @param {string} hostEmail - Host email
 * @param {string} hostName - Host name
 * @param {string} guestEmail - Guest email
 * @param {string} guestName - Guest name
 * @param {string} eventName - Event/meeting type name
 * @param {string} oldStartTime - Old meeting start time
 * @param {string} newStartTime - New meeting start time
 * @param {string} newEndTime - New meeting end time
 * @returns {Promise<Object>} Email send result with delivery status
 */
exports.sendRescheduleNotification = async (hostEmail, hostName, guestEmail, guestName, eventName, oldStartTime, newStartTime, newEndTime) => {
    const result = {
        guestEmail: guestEmail,
        hostEmail: hostEmail,
        success: false,
        guestEmailSent: false,
        hostEmailSent: false,
        messages: []
    };

    try {
        // Send reschedule email to guest
        try {
            const guestResponse = await resend.emails.send({
                from: FROM_EMAIL,
                to: guestEmail,
                subject: `Meeting Rescheduled: ${eventName}`,
                html: generateRescheduleEmailHtml(
                    guestName,
                    hostName,
                    eventName,
                    oldStartTime,
                    newStartTime,
                    newEndTime
                )
            });

            if (guestResponse.data?.id) {
                result.guestEmailSent = true;
                result.messages.push(`✓ Reschedule email sent to guest: ${guestEmail}`);
            }
        } catch (guestError) {
            result.messages.push(`✗ Failed to send reschedule email to guest ${guestEmail}: ${guestError.message}`);
        }

        // Send reschedule notification to host
        try {
            const hostResponse = await resend.emails.send({
                from: FROM_EMAIL,
                to: hostEmail,
                subject: `Booking Rescheduled: ${eventName}`,
                html: generateRescheduleNotificationEmailHtml(
                    hostName,
                    guestName,
                    eventName,
                    oldStartTime,
                    newStartTime,
                    newEndTime
                )
            });

            if (hostResponse.data?.id) {
                result.hostEmailSent = true;
                result.messages.push(`✓ Reschedule notification sent to host: ${hostEmail}`);
            }
        } catch (hostError) {
            result.messages.push(`✗ Failed to send reschedule notification to host ${hostEmail}: ${hostError.message}`);
        }

        result.success = result.guestEmailSent && result.hostEmailSent;
    } catch (error) {
        result.messages.push(`✗ Unexpected error in reschedule notification: ${error.message}`);
    }

    return result;
};

// HTML Email Templates

function generateBookingConfirmationEmailHtml(guestName, hostName, eventName, description, startTime, endTime) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const dateStr = startDate.toLocaleDateString();
    const startTimeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Booking Confirmed! ✓</h2>
            
            <p>Hi <strong>${guestName}</strong>,</p>
            
            <p>Your booking with <strong>${hostName}</strong> has been confirmed.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">${eventName}</h3>
                <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${dateStr}</p>
                <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${startTimeStr} - ${endTimeStr}</p>
                <p style="margin: 8px 0;"><strong>👤 Host:</strong> ${hostName}</p>
                ${description ? `<p style="margin: 8px 0; border-top: 1px solid #e0e0e0; padding-top: 8px; margin-top: 12px;"><strong>ℹ️ About this meeting:</strong><br/>${description.replace(/\n/g, '<br/>')}</p>` : ''}
            </div>
            
            <p>Thank you for booking! If you need to reschedule or cancel, please contact the host.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    `;
}

function generateBookingNotificationEmailHtml(hostName, guestName, guestEmail, eventName, description, startTime, endTime, guestEmailSent) {
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const dateStr = startDate.toLocaleDateString();
    const startTimeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const guestEmailStatus = guestEmailSent 
        ? `✓ Confirmation email successfully sent to guest (${guestEmail})`
        : `⚠️ Warning: Confirmation email could NOT be sent to guest (${guestEmail}). Guest did not receive confirmation. You may need to notify them separately.`;

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">New Booking Scheduled ✓</h2>
            
            <p>Hi <strong>${hostName}</strong>,</p>
            
            <p>A new booking has been created for your <strong>${eventName}</strong> event.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">${eventName}</h3>
                <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${dateStr}</p>
                <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${startTimeStr} - ${endTimeStr}</p>
                <p style="margin: 8px 0;"><strong>👤 Guest:</strong> ${guestName}</p>
                <p style="margin: 8px 0;"><strong>📧 Email:</strong> ${guestEmail}</p>
                ${description ? `<p style="margin: 8px 0; border-top: 1px solid #e0e0e0; padding-top: 8px; margin-top: 12px;"><strong>ℹ️ Meeting Details:</strong><br/>${description.replace(/\n/g, '<br/>')}</p>` : ''}
            </div>
            
            <div style="background-color: ${guestEmailSent ? '#e8f5e9' : '#fff3cd'}; padding: 12px; border-radius: 6px; border-left: 4px solid ${guestEmailSent ? '#4caf50' : '#ff9800'}; margin: 15px 0;">
                <p style="margin: 0; color: ${guestEmailSent ? '#2e7d32' : '#856404'};">
                    <strong>${guestEmailStatus}</strong>
                </p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    `;
}

function generateCancellationEmailHtml(guestName, hostName, eventName, startTime) {
    const startDate = new Date(startTime);
    const dateStr = startDate.toLocaleDateString();
    const startTimeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">Booking Cancelled</h2>
            
            <p>Hi <strong>${guestName}</strong>,</p>
            
            <p>Your booking with <strong>${hostName}</strong> has been cancelled.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">${eventName}</h3>
                <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${dateStr}</p>
                <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${startTimeStr}</p>
                <p style="margin: 8px 0;"><strong>👤 Host:</strong> ${hostName}</p>
            </div>
            
            <p>If you have any questions, please contact the host directly.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    `;
}

function generateCancellationNotificationEmailHtml(hostName, guestName, eventName, startTime) {
    const startDate = new Date(startTime);
    const dateStr = startDate.toLocaleDateString();
    const startTimeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">Booking Cancelled</h2>
            
            <p>Hi <strong>${hostName}</strong>,</p>
            
            <p>A booking has been cancelled.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">${eventName}</h3>
                <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${dateStr}</p>
                <p style="margin: 8px 0;"><strong>🕐 Time:</strong> ${startTimeStr}</p>
                <p style="margin: 8px 0;"><strong>👤 Guest:</strong> ${guestName}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    `;
}

function generateRescheduleEmailHtml(guestName, hostName, eventName, oldStartTime, newStartTime, newEndTime) {
    const oldDate = new Date(oldStartTime);
    const newStartDate = new Date(newStartTime);
    const newEndDate = new Date(newEndTime);
    
    const oldDateStr = oldDate.toLocaleDateString();
    const oldTimeStr = oldDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newDateStr = newStartDate.toLocaleDateString();
    const newStartTimeStr = newStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEndTimeStr = newEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1976d2;">Meeting Rescheduled</h2>
            
            <p>Hi <strong>${guestName}</strong>,</p>
            
            <p>Your meeting with <strong>${hostName}</strong> has been rescheduled.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">${eventName}</h3>
                
                <div style="background-color: #ffebee; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #c62828;"><strong>❌ Old Time (Cancelled)</strong></p>
                    <p style="margin: 5px 0 0 0; color: #666;">
                        ${oldDateStr} at ${oldTimeStr}
                    </p>
                </div>
                
                <div style="background-color: #e8f5e9; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #2e7d32;"><strong>✓ New Time (Confirmed)</strong></p>
                    <p style="margin: 5px 0 0 0; color: #666;">
                        ${newDateStr} at ${newStartTimeStr} - ${newEndTimeStr}
                    </p>
                </div>
            </div>
            
            <p>Please update your calendar. If you cannot attend the new time, please contact the host.</p>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    `;
}

function generateRescheduleNotificationEmailHtml(hostName, guestName, eventName, oldStartTime, newStartTime, newEndTime) {
    const oldDate = new Date(oldStartTime);
    const newStartDate = new Date(newStartTime);
    const newEndDate = new Date(newEndTime);
    
    const oldDateStr = oldDate.toLocaleDateString();
    const oldTimeStr = oldDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newDateStr = newStartDate.toLocaleDateString();
    const newStartTimeStr = newStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newEndTimeStr = newEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1976d2;">Booking Rescheduled</h2>
            
            <p>Hi <strong>${hostName}</strong>,</p>
            
            <p><strong>${guestName}</strong> has rescheduled their booking.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">${eventName}</h3>
                
                <div style="background-color: #ffebee; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #c62828;"><strong>❌ Old Time (Cancelled)</strong></p>
                    <p style="margin: 5px 0 0 0; color: #666;">
                        ${oldDateStr} at ${oldTimeStr}
                    </p>
                </div>
                
                <div style="background-color: #e8f5e9; padding: 10px; margin: 10px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #2e7d32;"><strong>✓ New Time (Confirmed)</strong></p>
                    <p style="margin: 5px 0 0 0; color: #666;">
                        ${newDateStr} at ${newStartTimeStr} - ${newEndTimeStr}
                    </p>
                </div>
                
                <p style="margin: 10px 0 0 0;"><strong>👤 Guest:</strong> ${guestName}</p>
            </div>
            
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    `;
}
