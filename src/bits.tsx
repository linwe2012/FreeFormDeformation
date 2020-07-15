
import React, { useRef, useEffect } from 'react';
import Slider from '@material-ui/core/Slider';
import { withStyles, makeStyles } from '@material-ui/core/styles';

export const PrettoSlider = withStyles({
    root: {
      color: '#52af77',
      height: 8,
    },
    thumb: {
      height: 24,
      width: 24,
      backgroundColor: '#fff',
      border: '2px solid currentColor',
      marginTop: -8,
      marginLeft: -12,
      '&:focus,&:hover,&$active': {
        boxShadow: 'inherit',
      },
    },
    active: {},
    valueLabel: {
      left: 'calc(-50% + 4px)',
    },
    track: {
      height: 8,
      borderRadius: 4,
    },
    rail: {
      height: 8,
      borderRadius: 4,
    },
  })(Slider);


export const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
    },
    Right: {
        maxHeight: '100vh',
        overflowY: 'scroll',
        paddingLeft: 20,
        paddingTop: theme.spacing(2)
    },
    slider: {
        display: 'inline'
    },
    sliderGroup:{
      marginTop: theme.spacing(3)
    }
}))

const FixedMaxWidth:React.FC =  (props)=>{
    const thediv = useRef<HTMLDivElement>(null)
    const wrap = useRef<HTMLDivElement>(null)
    useEffect(()=>{
        if(thediv.current && wrap.current) {
            thediv.current.style.width = wrap.current.style.width
        }
      
    }, [])
    return(
      <div ref={wrap} className='canvas-frame-wrapper'>
        <div ref={thediv} id="canvas-frame" className="canvas-frame"></div>
        {props.children}
      </div>
    )
  }

export { FixedMaxWidth }
