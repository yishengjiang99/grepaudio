import { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";

import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import { IconButton } from "@material-ui/core";
import { SkipNext, PlayArrowRounded, SkipPrevious } from "@material-ui/icons";

export interface InlineTextProp {
  text: string;
  subText: string;
  children?: string;
}
export const InlineText = (props: InlineTextProp) => {
  const { text, subText, children } = props;
  return (
    <Fragment>
      <Typography
        component="span"
        variant="body2"
        style={{ display: "inline" }}
        color="textPrimary"
      >
        {text}
      </Typography>
      {subText || ""}
    </Fragment>
  );
};

export function MediaListGrid({ children }) {
  return ColGrids({
    colwidth: "1fr 1fr 1fr",
    children: children,
  });
}

export function ColGrids(props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: props.colwidths || "1fr",
        gridColumnGap: props.colgap || 1,
      }}
    >
      {props.children}
    </div>
  );
}
export interface MediaCardProps {
  imageUrl: string;
  name: string;
  subtext: string;
  description: string;
  onClick: any;
  onClickText: string;
}
export function MediaCard(props: MediaCardProps) {
  const useStyles = makeStyles({
    root: {
      maxWidth: 345,
    },
    media: {
      height: 140,
    },
  });
  const classes = useStyles();
  const { imageUrl, name, subtext, description, onClick, onClickText } = props;
  return (
    <Card className={classes.root}>
      <CardActionArea>
        <CardMedia className={classes.media} image={imageUrl} title={subtext} />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {name}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions>
        <Button onClick={onClick}>{onClickText}</Button>
      </CardActions>
    </Card>
  );
}

export const ToolPanel = () => {
  return (
    <>
      <IconButton aria-label="previous">
        <SkipPrevious />
      </IconButton>
      <IconButton aria-label="play/pause">
        <PlayArrowRounded />
      </IconButton>
      <IconButton aria-label="next">
        <SkipNext />
      </IconButton>
    </>
  );
};
