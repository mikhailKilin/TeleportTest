import * as React from 'react'
import {CircularProgress, RaisedButton, TextField} from 'material-ui'
import * as request from 'superagent'


const signup_title = 'Sign up';
const login_title = 'Log in';

class LoginState {
    public isEmailUsed:boolean
    public submitted:boolean
    public form_title:string
    public created:boolean
    public fetch_error:boolean
    public unSuccessAuth:boolean

    constructor() {
        this.isEmailUsed = false
        this.submitted = false
        this.form_title = login_title
        this.created = false
        this.fetch_error = false
        this.unSuccessAuth = false
    }
}
export default class Login extends React.Component<{},{}> {
    public state:LoginState
    public refs:any
    public props:any

    constructor(props:any) {
        super(props)
        this.state = new LoginState()
    }

    onEmailChange = (ev) => {
        if (!this.state.isEmailUsed) {
            return;
        }
    }

    onEmailBlur = (ev) => {
        this.setState({isEmailUsed: true});
    }

    onSubmit = (ev) => {
        ev.preventDefault();

        //console.log(this.refs.email.getValue(), this.refs.pwd.getValue());
        this.setState({submitted: true});

        var login = this.refs.login.getValue();
        var password = this.refs.pwd.getValue();
        var url = this.isSignup() ? '/signup' : '/login';
        request
            .post(url)
            .send({login, password})
            .end((err, res) => {
                if (err) {
                    return this.setState({fetch_error: true});
                }

                if (!res.ok) {
                    throw new Error();
                }

                var data = res.body;

                if ((!data || !data.status) && !this.isSignup()) {
                    var thisState = this.state
                    thisState.unSuccessAuth = true
                    return this.setState(thisState);
                }

                if (!this.isSignup()) {
                    this.setState({unsuccessAuth: false});
                    return location.href = '/';
                } else {
                    this.setState({created: true});
                }
            })
        ;
    }

    goToSigUp = (ev) => {
        ev.preventDefault();

        this.setState({
            form_title: signup_title,
            unsuccessAuth: false,
            fetch_error: false,
            submitted: false,
            created: false
        });
    }

    goToLogin = (ev) => {
        ev.preventDefault();

        this.setState({
            form_title: login_title,
            unsuccessAuth: false,
            fetch_error: false,
            submitted: false,
            created: false
        });
    }

    isSignup() {
        return this.state.form_title == signup_title;
    }

    render() {
        var refresh = <CircularProgress size={0.7}/>
        var submitBtn = <RaisedButton
            type='submit'
            label={this.state.form_title}
            primary={true}
            fullWidth={true}
            backgroundColor='#4a89dc'
            style={{marginTop:'2em'}}
        />
        var confirmSign = (<p>Аккаунт создан.</p>);
        var fetchError = (<p>Произошла ошибка. Попробуйте зайти познее.</p>);
        var unsuccessAuth = (<p>Не верный логин или пароль.</p>);

        var dontHaveAccount = <p>Нет аккаунта?
            <a href='#' onClick={this.goToSigUp}>Создать аккаунт</a>
        </p>;
        var haveAccount = <p>Уже есть аккаунт?
            <a href='#' onClick={this.goToLogin}>Войти</a>
        </p>;

        var hasError = () => {
            return this.state.unSuccessAuth || this.state.fetch_error;
        }

        return (
            <div className="container flex-center">
                <form className='auth' onSubmit={this.onSubmit}>
                    <h1>{this.state.form_title}</h1>
                    <TextField
                        type='text'
                        floatingLabelText='Login'
                        style={{width:'100%'}}
                        onChange={this.onEmailChange}
                        onBlur={this.onEmailBlur}
                        ref='login'
                    />

                    <TextField
                        type='password'
                        floatingLabelText='Password'
                        style={{width:'100%'}}
                        ref='pwd'
                    />

                    {this.state.unSuccessAuth ? unsuccessAuth : null}
                    {this.state.submitted && !this.state.created && !hasError() ? refresh : null}
                    {this.state.submitted && this.state.created ? confirmSign : submitBtn}
                    {!this.isSignup() ? dontHaveAccount : haveAccount}
                    {this.state.fetch_error ? fetchError: null}
                </form>
            </div>

        );
    }
}
