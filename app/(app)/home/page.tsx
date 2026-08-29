import type { Metadata } from "next"
import Link from "next/link"

import { PlaceholderFrame } from "@/components/placeholders/placeholder-frame"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Home",
}

type Topic = "architecture" | "mechanics" | "computing"

type ProjectCard = {
  id: string
  title: string
  topic: Topic
}

const recentByTopic: Record<Topic, ProjectCard[]> = {
  computing: [{ id: "desktop-pc", title: "Desktop PC", topic: "computing" }],
  architecture: [
    { id: "studio-apartment", title: "Studio apartment", topic: "architecture" },
  ],
  mechanics: [{ id: "city-bike", title: "City bike", topic: "mechanics" }],
}

const recentlyAdded: ProjectCard[] = [
  { id: "desktop-pc", title: "Desktop PC", topic: "computing" },
  { id: "studio-apartment", title: "Studio apartment", topic: "architecture" },
  { id: "city-bike", title: "City bike", topic: "mechanics" },
]

const topicOrder: Topic[] = ["computing", "architecture", "mechanics"]

function ProjectLink({ project }: { project: ProjectCard }) {
  return (
    <Link href={`/canvas/${project.id}`} className="block">
      <Card size="sm" className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          <CardDescription>Open canvas placeholder</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">{project.topic}</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-8">
      <div>
        <h1 className="font-heading text-2xl font-medium">Home</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Recent projects by topic, plus newly added projects. Data is mocked.
        </p>
      </div>

      <PlaceholderFrame label="Recent projects by topic">
        <div className="grid gap-6 md:grid-cols-3">
          {topicOrder.map((topic) => (
            <div key={topic} className="space-y-3">
              <h2 className="text-sm font-medium capitalize">{topic}</h2>
              <div className="space-y-2">
                {recentByTopic[topic].map((project) => (
                  <ProjectLink key={project.id} project={project} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PlaceholderFrame>

      <PlaceholderFrame label="Newly added projects">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentlyAdded.map((project) => (
            <ProjectLink key={project.id} project={project} />
          ))}
        </div>
      </PlaceholderFrame>
    </main>
  )
}
