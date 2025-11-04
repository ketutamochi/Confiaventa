
// app.js - simplified registration, upload and publish logic using Firebase compat SDK
const adminEmail = "confiaventamx@gmail.com"; // administrador verificador

// Initialize firebase (firebase-config.js must define firebaseConfig)
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// UI elements
const btnRegister = document.getElementById('btnRegister');
const btnLogin = document.getElementById('btnLogin');
const btnLogout = document.getElementById('btnLogout');
const btnPublish = document.getElementById('btnPublish');
const registerForm = document.getElementById('registerForm');
const authSection = document.getElementById('authSection');
const appSection = document.getElementById('appSection');
const userEmailEl = document.getElementById('userEmail');
const publishStatus = document.getElementById('publishStatus');

// Register flow: create user, upload image to storage, save profile to firestore with aprobado:false
btnRegister.addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const curp = document.getElementById('curp').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const fileInput = document.getElementById('docFile');
  if (!name || !curp || !phone || !email || !password || fileInput.files.length === 0) {
    alert('Completa todos los campos y sube una imagen JPG/PNG.');
    return;
  }
  const file = fileInput.files[0];
  // Validate file type
  const allowed = ['image/jpeg','image/png'];
  if (!allowed.includes(file.type)) {
    alert('El documento debe ser JPG o PNG.');
    return;
  }
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;
    // upload file
    const storageRef = storage.ref().child('documents/' + uid + '/' + file.name);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    // save profile
    await db.collection('users').doc(uid).set({
      name, curp, phone, email, aprobado: false, docUrl: downloadURL, createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert('Registro completado. El administrador revisará tu documento y te aprobará si todo está bien.');
  } catch (err) {
    console.error(err);
    alert('Error al registrarse: ' + err.message);
  }
});

// Login flow
btnLogin.addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    alert('Error al iniciar sesión: ' + err.message);
  }
});

// Auth state listener
auth.onAuthStateChanged(async user => {
  if (user) {
    userEmailEl.textContent = user.email;
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    // check approval state
    const doc = await db.collection('users').doc(user.uid).get();
    const data = doc.exists ? doc.data() : null;
    if (!data || !data.aprobado) {
      publishStatus.textContent = 'Tu cuenta aún no está aprobada para publicar.';
      btnPublish.disabled = true;
    } else {
      publishStatus.textContent = 'Cuenta aprobada. Ya puedes publicar.';
      btnPublish.disabled = false;
    }
  } else {
    userEmailEl.textContent = '';
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
  }
});

// Publish flow: only allowed if user.aprobado === true
btnPublish.addEventListener('click', async () => {
  const title = document.getElementById('postTitle').value.trim();
  const desc = document.getElementById('postDesc').value.trim();
  const user = auth.currentUser;
  if (!user) { alert('Debes iniciar sesión'); return; }
  const doc = await db.collection('users').doc(user.uid).get();
  const data = doc.exists ? doc.data() : null;
  if (!data || !data.aprobado) { alert('Tu cuenta no está aprobada para publicar.'); return; }
  if (!title) { alert('Agrega un título'); return; }
  try {
    await db.collection('posts').add({
      uid: user.uid, title, desc, createdAt: firebase.firestore.FieldValue.serverTimestamp(), authorName: data.name
    });
    publishStatus.textContent = 'Publicado correctamente (visible para usuarios).';
    document.getElementById('postTitle').value='';
    document.getElementById('postDesc').value='';
  } catch (err) {
    console.error(err);
    alert('Error al publicar: ' + err.message);
  }
});

// Logout
btnLogout.addEventListener('click', () => {
  auth.signOut();
});

// Admin helper: if the signed in user is the adminEmail, show a quick approval tool in console (manual)
console.log('Si inicias sesión como administrador (' + adminEmail + '), visita la colección "users" en Firestore para aprobar registros cambiando "aprobado" a true.');
