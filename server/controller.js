let nextEmp = 5
require('dotenv').config()
const { CONNECTION_STRING } = process.env

const Sequelize = require('sequelize')
const sequelize = new Sequelize(CONNECTION_STRING)



module.exports = {
    getUpcomingAppointments: (req, res) => {
        sequelize.query(`SELECT a.appt_id, a.date, a.service_type, a.approved, a.completed, u.first_name, u.last_name 
        FROM cc_appointments AS a
        JOIN cc_emp_appts AS ea ON a.appt_id = ea.appt_id
        JOIN cc_employees e ON e.emp_id = ea.emp_id
        JOIN cc_users u ON e.user_id = u.user_id
        WHERE a.approved = true AND a.completed = false
        ORDER BY a.date desc;`)
            .then(dbRes => res.status(200).send(dbRes[0]))
            .catch(err => console.log(err))
    },

    approveAppointment: (req, res) => {
        let { apptId } = req.body

        sequelize.query(`
            UPDATE cc_appointments
            SET approved = true
            WHERE appt_id = ${apptId};
            INSERT INTO cc_emp_appts (emp_id, appt_id)
            values (${nextEmp}, ${apptId}),
            (${nextEmp + 1}, ${apptId});
        `)
            .then(dbRes => {
                res.status(200).send(dbRes[0])
                nextEmp += 2
            })
            .catch(err => console.log(err))
    },
    getAllClients: (req, res) => {
        sequelize.query(`
                SELECT * FROM cc_users AS u
                JOIN cc_clients AS c
                ON u.user_id = c.user_id;
            `).then(dbRes => res.status(200).send(dbRes[0]))
            .catch(TheseHands => console.log(TheseHands))
    },
    getPendingAppointments: (req, res) => {
        sequelize.query(`
            SELECT * FROM cc_appointments
            WHERE approved = false
            ORDER BY date DESC;
        `).then(dbRes => res.status(200).send(dbRes[0]))
            .catch(TheseHands => console.log(TheseHands))
    },
    getPastAppointments: (req, res) => {
        sequelize.query(`
        SELECT a.appt_id, a.date, a.service_type, a.notes 
        FROM cc_appointments AS a
        JOIN cc_emp_appts AS ea 
        ON a.appt_id = ea.appt_id
        JOIN cc_employees AS e 
        ON e.emp_id = ea.emp_id
        JOIN cc_users AS u 
        ON e.user_id = u.user_id
        WHERE a.approved = true AND a.completed = true
        ORDER BY a.date DESC;
        `).then(dbRes => res.status(200).send(dbRes[0]))
            .catch(TheseHands => console.log(TheseHands))
    },
    completeAppointment: (req,res) => {
        let { apptId } = req.body

        sequelize.query(`
            UPDATE cc_appointments
            SET completed = true
            WHERE appt_id = ${apptId};
        `).then(dbRes => res.status(200).send(dbRes))
        .catch(TheseHands => console.log(TheseHands))
    }
}
