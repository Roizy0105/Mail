document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  document.querySelector('#compose-form').addEventListener('submit', ()=> {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
    });
  });

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails

      //Clear table
      document.querySelector('tbody').innerHTML = '';
      //loopover all emails returned from the ajax request
      emails.forEach((email, i) => {
        //create  a new row for every email
        const row = document.createElement("tr");
        row.innerHTML =
        `   <th scope="row">${email.sender}</th>
            <th scope="col"></th>
            <td>${email.subject}</td>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
            <th scope="col"></th>
            <td>${email.timestamp}</td>
        `
        if (email.read === true){
          row.style.background = "#D3D3D3";
        }
        //when this email is clicked
        row.addEventListener('click', function() {
          fetch(`/emails/${email.id}`)
          .then(response => response.json())
          .then(email => {
              // Print email
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#email-view').style.display = 'block';
              document.querySelector('#email-view').innerHTML = `
                <div><b>From:</b> ${email.sender}</div>
                <div><b>To:</b> ${email.recipients}</div>
                <div><b>Subject:</b> ${email.subject}</div>
                <div><b>Timestamp:</b> ${email.timestamp}</div>
                <br>
                <br>
                <button id="archive" style="display:none;">Archive</button>
                <button id="unarchive" style="display:none;">Unarchive</button>
                <button id="reply">Reply</button>
                <br>
                <br>
                <h3>Body:</h3>
                <div>${email.body}</div>
              `
              //mark email as read
              fetch(`/emails/${email.id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
              })

              //display appropiate button base on whether or not this email is archived
              if (email.archived === true){
                document.querySelector('#unarchive').style.display = "block"
              }
              else{
                document.querySelector('#archive').style.display = "block"
              }
              //when user clicks on archive button
               document.querySelector('#archive').addEventListener('click', () => {
                 //change the value of archived to true
                 fetch(`/emails/${email.id}`, {
                   method: 'PUT',
                   body: JSON.stringify({
                       archived: true
                   })
                 })
                 document.querySelector('#emails-view').style.display = 'block';
                 document.querySelector('#email-view').style.display = 'none';
               });

               //when user clicks on unarchive button
                document.querySelector('#unarchive').addEventListener('click', () => {
                  //change the value of archived to false
                  fetch(`/emails/${email.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: false
                    })
                  })
                  document.querySelector('#emails-view').style.display = 'block';
                  document.querySelector('#email-view').style.display = 'none';
                });


               //when user clicks on archive button
                document.querySelector('#reply').addEventListener('click', () => {
                  document.querySelector('#emails-view').style.display = 'none';
                  document.querySelector('#compose-view').style.display = 'block';
                  document.querySelector('#email-view').style.display = 'none';

                  document.querySelector('#compose-recipients').value = email.sender
                  document.querySelector('#compose-subject').value = `Re: ${email.subject}`
                  document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`

                });


          });
        });
        document.querySelector('tbody').append(row);
      });

  });

  // Show the mailbox name
  document.querySelector('#title').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}
