import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import "../App.css";
import {
  Button,
  TextField,
  makeStyles,
  Container,
  Box,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Paper,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const MyStyle = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    width:"100%"
  },

  formContainer: {
    background: "#f3f3f3",
    width: "100%",
    maxWidth: "600px",
    borderRadius: "5px",
    textAlign:"center"
  },
  contentWrapper: {
    width: "100%",
    maxWidth: "600px",
    marginTop: "20px",
  },
  Datalist: {
    background: "#f9f9f9",
    padding: "10px 20px",
    marginBottom: "4px",
  },
  loadingWrapper: {
    display: "flex",
    justifyContent: "center",
    marginTop: "10px",
    height: "100px",
  },
  buttoncenter:{
    textAlign:"center",
  },
  fontcolor:{
    color:"#fff"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }
}));

const getTodos = gql`
  {
    allTasks {
      id
      text
      completed
    }
  }
`;

const addTodo = gql`
  mutation addTask($text: String!) {
    addTask(text: $text) {
      text
    }
  }
`;

const deleteTodo = gql`
  mutation deleteTask($id: ID!) {
    deleteTask(id: $id) {
      text
    }
  }
`;

export default function Home() {
  const classes = MyStyle();
  const [task, setTask] = useState<string>("");

  const { loading, error, data } = useQuery(getTodos);
  const [deleteTask] = useMutation(deleteTodo);
  const [addTask] = useMutation(addTodo);

  if (error) {
    return <h2>Error</h2>;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    if (task !== "") {
      addTask({
        variables: {
          text: task,
        },
        refetchQueries: [{ query: getTodos }],
      });
      setTask("");
    }
  };

  const handleDelete = (id) => {
    console.log(JSON.stringify(id));
    deleteTask({
      variables: {
        id: id,
      },
      refetchQueries: [{ query: getTodos }],
    });
  };

  return (
    <Container>
      <div className={classes.mainContainer}>
        <Box py={8}>
          <Typography className={classes.fontcolor} variant="h5">Gatsby GRAPHQL TODO</Typography>
        </Box>
      </div>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <div className={classes.mainContainer}>
              <Box py={1}>
                <Typography variant="h5">Enter Todo Below</Typography>
              </Box>
            </div>
            <div className={classes.formContainer}>
              <Box p={6}>
                <form onSubmit={handleSubmit}>
                  <Box pb={2}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      label="Enter Todo"
                      name="task"
                      required
                    />
                  </Box>
                  <Button type="submit" variant="contained" color="primary">
                    add Todo
                  </Button>
                </form>
              </Box>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <div className={classes.mainContainer}>
              <Box py={1}>
                <Typography variant="h5">List Of Todos</Typography>
              </Box>
            </div>
            <div className={classes.contentWrapper}>
              <Box py={1}>
                  {loading ? (
                    <div className={classes.loadingWrapper}>
                      <CircularProgress />
                    </div>
                  ) : (
                    data.allTasks.map((task) => (
                      <div key={task.id} className={classes.Datalist}>
                        <Grid container>
                          <Grid item xs={10} container alignItems="center">
                            <Typography>{task.text}</Typography>
                          </Grid>
                          <Grid container justify="flex-end" item xs={2}>
                            <IconButton onClick={() => handleDelete(task.id)}>
                              <CloseIcon color="secondary" fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </div>
                    ))
                  )}
                </Box>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
