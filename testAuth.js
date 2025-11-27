// This file demonstrates how to test the authentication endpoints
// You can use this with tools like Postman, Insomnia, or run with Node.js

const BASE_URL = 'http://localhost:5000/api/auth';

// Example 1: Test Signup
async function testSignup() {
    const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testPassword123',
    };

    try {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        console.log('Signup Response:', data);

        if (response.ok) {
            console.log('✓ Signup successful!');
            console.log('Token:', data.token);
            return data.token;
        } else {
            console.log('✗ Signup failed:', data.message);
        }
    } catch (error) {
        console.error('Error during signup:', error);
    }
}

// Example 2: Test Signin
async function testSignin() {
    const credentials = {
        email: 'test@example.com',
        password: 'testPassword123',
    };

    try {
        const response = await fetch(`${BASE_URL}/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Signin Response:', data);

        if (response.ok) {
            console.log('✓ Signin successful!');
            console.log('Token:', data.token);
            return data.token;
        } else {
            console.log('✗ Signin failed:', data.message);
        }
    } catch (error) {
        console.error('Error during signin:', error);
    }
}

// Example 3: Test Logout
async function testLogout() {
    try {
        const response = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('Logout Response:', data);

        if (response.ok) {
            console.log('✓ Logout successful!');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Example 4: Test Protected Route (you'll need to create a protected route first)
async function testProtectedRoute(token) {
    try {
        const response = await fetch('http://localhost:5000/api/protected-example', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        console.log('Protected Route Response:', data);

        if (response.ok) {
            console.log('✓ Access to protected route successful!');
        } else {
            console.log('✗ Access denied:', data.message);
        }
    } catch (error) {
        console.error('Error accessing protected route:', error);
    }
}

// Run all tests in sequence
async function runAllTests() {
    console.log('=== Starting Authentication Tests ===\n');

    console.log('1. Testing Signup...');
    const signupToken = await testSignup();
    console.log('\n---\n');

    console.log('2. Testing Signin...');
    const signinToken = await testSignin();
    console.log('\n---\n');

    console.log('3. Testing Logout...');
    await testLogout();
    console.log('\n---\n');

    if (signinToken) {
        console.log('4. Testing Protected Route (if it exists)...');
        await testProtectedRoute(signinToken);
    }

    console.log('\n=== Tests Complete ===');
}

// Uncomment to run tests:
// runAllTests();

module.exports = {
    testSignup,
    testSignin,
    testLogout,
    testProtectedRoute,
    runAllTests,
};
