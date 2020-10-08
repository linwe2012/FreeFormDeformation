import React, { useState } from 'react';
import './App.css';
import Render from './render'

import { PrettoSlider, useStyles, FixedMaxWidth } from './bits'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const Labels = [
  'Lattice X', 'Lattice Y', 'Lattice Z'
] as const

const Selects = [
  'book', 'car', 'sphere', 'cube', 'donut'
] as const

const App: React.FC = () => {
  const classes = useStyles()
  const [ctrlPointsDims, setCtrlPointsDims] = useState<[number, number, number]>([2, 2, 2])
  const [scene, setScene] = useState(0)
  return (
    <div className="App">
      <Grid container className={classes.root}>
        <Grid item xs={9}>
        <FixedMaxWidth>
        <Render 
          ctrlPointsDims={ctrlPointsDims}
          scene={Selects[scene]}
        />
        </FixedMaxWidth>
      </Grid>
      <Grid item xs={3} className={classes.Right}>

      <FormControl variant="filled" fullWidth>
        <InputLabel htmlFor="filled-scene">Scene</InputLabel>
        <Select
          value={scene}
          onChange={(e: any)=>setScene(e.target.value)}
          inputProps={{
            name: 'scene',
            id: 'filled-scene',
          }}
        >
          {
            Selects.map((v, idx)=>{return (
              <MenuItem key={idx} value={idx}>{v}</MenuItem>
            )})
          }
        </Select>
      </FormControl>
        <div className={classes.sliderGroup}>
        {
          ctrlPointsDims.map((v, idx)=>{return (
            <div style={{textAlign:'left'}} key={idx}>
            <Typography display='inline'>
              {Labels[idx]}
            </Typography>
            <PrettoSlider 
              valueLabelDisplay="auto" 
              
              onChangeCommitted={(e:any, val)=>{
                const arr = [...ctrlPointsDims] as [number, number, number]
                arr[idx] = Number(val)
                setCtrlPointsDims(arr)
              }} 
              defaultValue={2} 
              min={1} max={10}
            />
            </div>
          )})
        }
        </div>
      </Grid>
      </Grid>
    </div>
  );
}

export default App;
