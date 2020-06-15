import React from "react";
import Slider from "@material-ui/core/Slider";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useState, Fragment } from "react";
import NoSsr from "@material-ui/core/NoSsr";

const useStyles = makeStyles({
  root: {
    width: 300,
  },
});
function valuetext(value) {
  return `${value}`;
}

export const genericConfig = ({
  defaults,
  onInput,
  attributes, //["attack", "decay", "sustain", "release"],
}) => {
  attributes = attributes || ["attack", "decay", "sustain", "release"];
  const classes = useStyles();
  const [adsr, setAdsr] = useState(defaults);
  const setValue = (attr, val) => {
    adsr[attr] = val;
    setAdsr(adsr);
    onInput(attr, val);
  };
  return (
    <div>
      {attributes.map((attribute) => {
        return (
          <Fragment key={attribute}>
            <Typography
              key={`${attribute}-slider-label`}
              id={`${attribute}-slider-label`}
            >
              {attribute}: {adsr[attribute]}
            </Typography>
            <Slider
              onTouchStart={(e) => e.preventDefault()}
              key={`${attribute}-slider`}
              getAriaValueText={`${attribute}-slider-label`}
              defaultValue={defaults[attribute]}
              value={adsr[attribute]}
              onChange={(e, v) => {
                setValue(attribute, v);
              }}
              min={0}
              max={1}
              step={0.01}
              getAriaValueText={valuetext}
            ></Slider>
          </Fragment>
        );
      })}
    </div>
  );
};
const EnvelopConfig = ({ defaults, onInput }) =>
  genericConfig({
    defaults,
    onInput,
    attributes: ["attack", "decay", "sustain", "release"],
  });
// const attributeSlider = ( attribute, defaults )=>
export default EnvelopConfig;

export const ParamConfig = ({
  param,
  defaultVal,
  min,
  max,
  onInput,
  step,

  disabled,
}) => {
  const [val, setVal] = useState(1);

  return (
    <NoSsr>
      <Typography key={`${param}-slider-label`} id={`${param}-slider-label`}>
        {param}: {val}
      </Typography>
      <input
        type="range"
        // disabled={disabled}
        key={`${param}-slider`}
        getAriaValueText={`${param}-slider-label`}
        value={val}
        onInput={(e) => {
          setVal(e.target.value);
          if (onInput) onInput(e, e.target.value);
        }}
        min={min || 0}
        max={max || 10}
        step={step || 0.01}
        defaultValue={1}
        getAriaValueText={valuetext}
      ></input>
    </NoSsr>
  );
};
