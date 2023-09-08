import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import Input from "@mui/joy/Input";
import Autocomplete, {
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
} from "@mui/joy/Autocomplete";

import "./App.css";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from "@mui/joy";

interface Location {
  cityName: string;
  countryId: string;
  countryName: string;
  entityId: string;
  heirarchy: string;
  iataCode: string;
  location: string;
  name: string;
  type: string;
}

enum Stage {
  LOCATION,
  DAYS,
  ACTIVITIES,
}

const getNextStage = (stage: Stage) => {
  switch (stage) {
    case Stage.LOCATION:
      return Stage.DAYS;

    case Stage.DAYS:
      return Stage.ACTIVITIES;

    default:
      return Stage.LOCATION;
  }
};

function App() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<Location | null>(null);
  const [stage, setStage] = useState<Stage>(Stage.LOCATION);

  const [value, setValue] = useState<string>("");
  const debouncedValue = useDebounce<string>(value, 500);

  const handleChange = (event: any) => {
    setValue(event.target.value);
  };

  useEffect(() => {
    if (!debouncedValue) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setResults([]);
      const res = await fetch(
        "https://staging--itinerary-planner-kDjob2.keelapps.xyz/api/json/autoSuggestDestinations",
        {
          method: "POST",
          headers: {},
          body: JSON.stringify({ destination: debouncedValue }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch. Status: ${res.status}`);
      }

      let results;
      const contentType = res.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        results = await res.json();
      } else {
        results = await res.text();
      }

      setIsLoading(false);
      setResults(results);
    };

    fetchResults();
  }, [debouncedValue]);

  console.log({ selectedValue });

  return (
    <>
      {selectedValue && stage !== Stage.LOCATION && (
        <Typography level="h1" fontSize="xl" marginBottom={5}>
          Let's plan your trip to {selectedValue.countryName}!
        </Typography>
      )}

      <Card variant="outlined" size="lg" sx={{ width: 500, height: 250 }}>
        <CardContent>
          <Stack spacing={10}>
            {stage === Stage.LOCATION && (
              <FormControl>
                <FormLabel>Where do you want to go?</FormLabel>
                {/* <Input placeholder="Search..." onChange={handleChange} /> */}
                <Autocomplete
                  sx={{ width: 300 }}
                  placeholder="Get searching..."
                  options={results}
                  getOptionLabel={(option: Location) =>
                    `${option.name}, ${option.cityName}, ${option.countryName}`
                  }
                  onInputChange={handleChange}
                  onChange={(e, v) => setSelectedValue(v)}
                  loading={isLoading}
                  endDecorator={
                    isLoading ? (
                      <CircularProgress
                        size="sm"
                        sx={{ bgcolor: "background.surface" }}
                      />
                    ) : null
                  }
                />
              </FormControl>
            )}
            {stage === Stage.DAYS && (
              <FormControl>
                <FormLabel>For how many days?</FormLabel>
                {/* <Input placeholder="Search..." onChange={handleChange} /> */}
              </FormControl>
            )}
          </Stack>
        </CardContent>
        <CardActions>
          <Typography level="title-lg" sx={{ mr: "auto" }}>
            {/* 3.990€{" "}
            <Typography fontSize="sm" textColor="text.tertiary">
              / month
            </Typography> */}
          </Typography>
          <Button
            // sx={{ ml: "auto" }}
            variant="soft"
            // color="neutral"
            // endDecorator={<KeyboardArrowRight />}
            type="submit"
            disabled={selectedValue === null}
            onClick={() => setStage(getNextStage(stage))}
          >
            Next
          </Button>
        </CardActions>
      </Card>
    </>
  );
}

export default App;
